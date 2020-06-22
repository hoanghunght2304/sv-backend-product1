/* eslint-disable indent */
import httpStatus from 'http-status';
import moment from 'moment-timezone';
import { Model, DataTypes, Op } from 'sequelize';
import { AppEvent } from 'rabbit-event-source';
import { isEqual, includes, pick, values, keys, omitBy, isNil } from 'lodash';

import postgres from '../../config/postgres';
import { serviceName } from '../../config/vars';
import APIException from '../utils/APIException';
import messages from '../../config/messages';
import eventBus from '../services/events/event-bus';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class Export extends Model { }

Export.Statuses = {
    DELIVERY: 'delivery',
    CANCELLED: 'cancelled',
    CONFIRMED: 'confirmed',
    RETURNING: 'returning',
    RETURNED: 'returned',
};

Export.GroupTypes = {
    MATERIAL: 'material',
    OTHER: 'other',
    ITEM: 'item'
};

Export.Types = {
    EXPORT_IN_STORE: 1,
    EXPORT_OUT_STORE: 2,
    EXPORT_PRODUCTION: 3
};

/**
 * Export Schema
 * @public
 */
Export.init(
    {
        /** attributes */
        id: {
            type: DataTypes.STRING(50),
            primaryKey: true
        },
        type: {
            type: DataTypes.INTEGER,
            defaultValue: Export.Types.EXPORT_IN_STORE
        },
        note: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        reason: {
            type: DataTypes.STRING(255),
            defaultValue: null
        },

        /** detail */
        source: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {
                id: null,
                name: null,
                phone: null,
                address: null
            }
        },
        store: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {
                id: null,
                name: null,
                phone: null,
                address: null
            }
        },
        status: {
            type: DataTypes.STRING(25),
            values: values(Export.Statuses.DELIVERY),
            defaultValue: Export.Statuses.DELIVERY
        },
        received_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null
        },
        total_quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_price: {
            type: DataTypes.DECIMAL,
            defaultValue: 0
        },
        /** management */
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        created_by: {
            type: DataTypes.JSONB,
            defaultValue: {
                id: null,
                name: null,
                roles: null
            }
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: () => new Date()
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: () => new Date()
        }
    },
    {
        timestamps: false,
        sequelize: sequelize,
        modelName: 'export',
        tableName: 'tbl_exports'
    }
);

/**
 * Register event emiter
 */
Export.EVENT_SOURCE = `${serviceName}.export`;
Export.Events = {
    EXPORT_CREATED: `${serviceName}.export.export_created`,
    EXPORT_CANCELLED: `${serviceName}.export.export_cancelled`,
    EXPORT_CONFIRMED: `${serviceName}.export.export_confirmed`,
    EXPORT_RETURNED: `${serviceName}.export.export_returned`
};

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
Export.addHook('beforeCreate', async (model) => {
    const goodsIssue = model;
    goodsIssue.id = await Export.generateExportId();
    return goodsIssue;
});

Export.addHook('afterCreate', (model, options) => {
    const { params } = options;
    const dataValue = model.dataValues;

    /**
     * case 1: add item to export detail
     * case 2: change quantity item exported
     */
    eventBus.emit(
        Export.Events.EXPORT_CREATED,
        {
            user: dataValue.created_by,
            model: dataValue,
            products: params.items
        }
    );
});

Export.addHook('afterUpdate', (model, options) => {
    const { params } = options;
    const newModel = model.dataValues;
    const oldModel = model._previousDataValues;
    const dataChanged = keys(model._changed);

    /**
     * case 1: log to event-store when export bill updated
     * case 2: revert quantity when export bill cancelled, returned
     * case 3: increment quantity for store receiver when export bill confirmed
     */
    switch (params.event_source) {
        case Export.Events.EXPORT_RETURNED:
        case Export.Events.EXPORT_CANCELLED:
        case Export.Events.EXPORT_CONFIRMED:
            eventBus.emit(
                params.event_source,
                {
                    user: pick(params.updated_by, ['id', 'name']),
                    model: newModel,
                    products: params.items
                }
            );
            break;
        default:
            eventBus.emit(
                AppEvent.Events.APP_EVENT_UPDATED,
                {
                    source: 'exports',
                    message: `${params.updated_by.id} đã cập nhật thông tin phiếu xuất kho: ${newModel.id}`,
                    user: params.updated_by,
                    data: {
                        id: newModel.id,
                        old: pick(oldModel, dataChanged),
                        new: pick(newModel, dataChanged)
                    }
                }
            );
            break;
    }
});

/**
 * Transform postgres model to expose object
 */
Export.transform = (model) => {
    const transformed = {};
    const fields = [
        /** attributes */
        'id',
        'type',
        'note',
        'reason',

        /** detail */
        'source',
        'store',
        'items',
        'status',
        'received_at',
        'total_quantity',
        'total_price',

        /** row management */
        'created_by',
        'created_at',
        'updated_at'
    ];

    fields.forEach((field) => {
        transformed[field] = model[field];
    });

    transformed.total_price = +model.total_price;
    transformed.created_at = moment(model.created_at).unix();
    transformed.updated_at = moment(model.updated_at).unix();
    transformed.received_at = moment(model.received_at).unix();
    return transformed;
};

/**
 * Get all changed properties
 *
 * @public
 * @param {Object} data newModel || oleModel
 */
Export.getChangedProperties = ({ newModel, oldModel }) => {
    const changedProperties = [];
    const allChangableProperties = ['note', 'reason'];

    /** get all changable properties */
    keys(newModel).forEach((field) => {
        if (includes(allChangableProperties, field)) {
            changedProperties.push(field);
        }
    });

    /** get data changed */
    const dataChanged = [];
    changedProperties.forEach(field => {
        if (!isEqual(newModel[field], oldModel[field])) {
            dataChanged.push(field);
        }
    });
    return dataChanged;
};

/**
 * Generate Export Id
 */
Export.generateExportId = async () => {
    const goodsIssue = await Export.findOne({
        order: [
            ['created_at', 'desc']
        ]
    });
    if (!goodsIssue) return '1000';
    return parseInt(goodsIssue.id, 10) + 1;
};


/**
 * Filter condition
 * @private
 */

/**
 * Load query
 * @param {*} params
 */
function filterConditions(params) {
    const options = omitBy(params, isNil);
    const conditions = {
        is_active: true,
    };

    if (options.start_time && options.end_time) {
        options.start_time.setHours(0, 0, 0, 0); options.end_time.setHours(23, 59, 59, 999);
    }

    // TODO: load condition
    if (options.keyword) {
        conditions.id = {
            [Op.iLike]: `%${options.keyword}%`
        };
    }
    if (options.types) {
        conditions.type = {
            [Op.in]: options.types.split(',')
        };
    }
    if (options.sources && options.stores) {
        conditions[Op.or] = [
            { 'source.id': { [Op.in]: options.sources.split(',') } },
            { 'store.id': { [Op.in]: options.stores.split(',') } }
        ];
    } else {
        if (options.stores) {
            conditions['store.id'] = {
                [Op.in]: options.stores.split(',')
            };
        }
        if (options.sources) {
            conditions['source.id'] = {
                [Op.in]: options.sources.split(',')
            };
        }
    }
    if (options.statuses) {
        conditions.status = {
            [Op.in]: options.statuses.split(',')
        };
    }
    if (options.start_time && options.end_time && options.by_date === 'delivery') {
        conditions.created_at = {
            [Op.between]: [options.start_time, options.end_time]
        };
    }
    if (options.start_time && options.end_time && options.by_date === 'received') {
        conditions.received_at = {
            [Op.between]: [options.start_time, options.end_time]
        };
    }

    return conditions;
}


/**
 * List exports in descending order of 'createdAt' timestamp.
 *
 * @param {number} skip - Number of users to be skipped.
 * @param {number} limit - Limit number of users to be returned.
 * @returns {Promise<Export[]>}
 */
Export.list = async ({
    keyword,
    types,
    sources,
    stores,
    statuses,
    start_time,
    end_time,
    by_date,
    skip = 0,
    limit = 20,
}) => {
    const options = filterConditions({
        keyword,
        types,
        sources,
        stores,
        statuses,
        start_time,
        end_time,
        by_date
    });
    return Export.findAll({
        where: options,
        order: [
            ['updated_at', 'desc']
        ],
        offset: skip,
        limit: limit
    });
};

/**
 * Total records.
 *
 * @param {number} skip - Number of users to be skipped.
 * @param {number} limit - Limit number of users to be returned.
 * @returns {Promise<Number>}
 */
Export.totalRecords = ({
    keyword,
    types,
    sources,
    stores,
    statuses,
    start_time,
    end_time,
    by_date
}) => {
    const options = filterConditions({
        keyword,
        types,
        sources,
        stores,
        statuses,
        start_time,
        end_time,
        by_date
    });

    return Export.count({ where: options });
};

/**
 * Get Export By Id
 *
 * @public
 * @param {String} exportId
 */
Export.get = async (exportId) => {
    try {
        const result = await sequelize.query(`
            SELECT 
                ex.*,
                jsonb_agg( 
                    jsonb_build_object(
                        'id', p.id,
                        'name', p.name,
                        
                        'properties', p.properties,
                        'category_id', p.category_id,
                        'category_two_id', p.category_two_id,
                        'category_three_id', p.category_three_id,
                        'total_quantity', d.total_quantity,
                        'total_price', d.total_price
                    )
                ) as items
            FROM tbl_exports AS ex
                INNER JOIN tbl_export_details AS d ON ex.id = d.export_id
                INNER JOIN tbl_products AS p ON p.id = d.item_id
            WHERE ex.id = '${exportId}'
            GROUP BY ex.id`
        );

        if (!result[0][0]) {
            throw new APIException({
                status: httpStatus.NOT_FOUND,
                message: messages.NOT_FOUND
            });
        }
        return result[0][0];
    } catch (ex) {
        throw (ex);
    }
};

/**
 * Generate Table
 */
Export.sync({});

/**
 * @typedef Export
 */
export default Export;
