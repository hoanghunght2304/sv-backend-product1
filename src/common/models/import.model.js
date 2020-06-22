/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
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
class Import extends Model { }

Import.Statuses = {
    CHECKING: 'checking',
    CANCELLED: 'cancelled',
    CONFIRMED: 'confirmed',
};

Import.GroupTypes = {
    MATERIAL: 'material',
    OTHER: 'other',
    ITEM: 'item'
};

/**
 * Import Schema
 * @public
 */
Import.init(
    {
        /** attributes */
        id: {
            type: DataTypes.STRING(50),
            primaryKey: true
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
            values: values(Import.Statuses),
            defaultValue: Import.Statuses.CHECKING
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
            allowNull: false,
            defaultValue: {
                id: null,
                name: null
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
        modelName: 'import',
        tableName: 'tbl_imports'
    }
);

/**
 * Register event emiter
 */
Import.EVENT_SOURCE = `${serviceName}.import`;
Import.Events = {
    IMPORT_CREATED: `${serviceName}.import.import_created`,
    IMPORT_CONFIRMED: `${serviceName}.import.import_confirmed`,
    IMPORT_CANCELLED: `${serviceName}.import.import_cancelled`
};

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
Import.addHook('beforeCreate', async (model) => {
    const goodsReceipt = model;
    goodsReceipt.id = await Import.generateImportId();
    return goodsReceipt;
});

Import.addHook('afterCreate', (model, options) => {
    const { params } = options;
    const dataValue = model.dataValues;

    /**
     * case 1: add item to import detail
     */
    eventBus.emit(
        Import.Events.IMPORT_CREATED,
        {
            user: dataValue.created_by,
            model: dataValue,
            items: params.items
        }
    );
});

Import.addHook('afterUpdate', (model, options) => {
    const { params } = options;
    const newModel = model.dataValues;
    const oldModel = model._previousDataValues;
    const dataChanged = keys(model._changed);

    /**
     * case 1: log to event-store when import bill updated
     * case 2: update quantity to store when import bill comfirmed
     */
    switch (params.event_source) {
        case Import.Events.IMPORT_CONFIRMED:
            eventBus.emit(
                params.event_source,
                {
                    user: pick(params.updated_by, ['id', 'name']),
                    model: newModel,
                    items: params.items
                }
            );
            break;

        default: {
            const message = params.event_source === Import.Events.IMPORT_CANCELLED
                ? 'đã hủy phiếu nhập kho:'
                : 'đã cập nhật thông tin phiếu nhập kho:';

            eventBus.emit(
                AppEvent.Events.APP_EVENT_UPDATED,
                {
                    source: 'imports',
                    message: `${params.updated_by.id} ${message} ${newModel.id}`,
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
    }
});

/**
 * Transform mongoose model to expose object
 */
Import.transform = (model) => {
    const transformed = {};
    const fields = [
        /** attributes */
        'id',
        'note',
        'reason',

        /** detail */
        'source',
        'store',
        'items',
        'status',
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
    return transformed;
};

/**
 * Get all changed properties
 *
 * @public
 * @param {Object} data newModel || oleModel
 */
Import.getChangedProperties = ({ newModel, oldModel }) => {
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
 * Load query
 * @param {*} params
 */
function filterConditions(params) {
    const options = omitBy(params, isNil);
    const conditions = {
        is_active: true,
    };

    // TODO: load condition
    if (options.keyword) {
        conditions.id = {
            [Op.iLike]: `%${options.keyword}%`
        };
    }

    if (options.stores) {
        conditions['store.id'] = {
            [Op.in]: options.stores.split(',')
        };
    }

    if (options.statuses) {
        conditions.status = {
            [Op.in]: options.statuses.split(',')
        };
    }

    if (options.start_time && options.end_time) {
        options.start_time.setHours(0, 0, 0, 0); options.end_time.setHours(23, 59, 59, 999);
        conditions.created_at = {
            [Op.between]: [options.start_time, options.end_time]
        };
    }

    return conditions;
}


/**
 * Generate Import Id
 */
Import.generateImportId = async () => {
    const goodsReceipt = await Import.findOne({
        order: [
            ['created_at', 'desc']
        ]
    });
    if (!goodsReceipt) return '1000';
    return parseInt(goodsReceipt.id, 10) + 1;
};


/**
 * Get Import By Id
 *
 * @public
 * @param {String} importId
 */
Import.get = async (importId) => {
    try {
        const result = await sequelize.query(`
            SELECT 
                i.*,
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
            FROM tbl_imports AS i
                INNER JOIN tbl_import_details AS d ON i.id = d.import_id
                INNER JOIN tbl_products AS p ON p.id = d.item_id
            WHERE i.id = '${importId}'
            GROUP BY i.id`
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
 * List imports in descending order of 'createdAt' timestamp.
 *
 * @param {number} skip - Number of users to be skipped.
 * @param {number} limit - Limit number of users to be returned.
 * @returns {Promise<Import[]>}
 */
Import.list = async ({
    keyword,
    stores,
    statuses,
    start_time,
    end_time,
    skip = 0,
    limit = 20,
}) => {
    const options = filterConditions({
        keyword,
        stores,
        statuses,
        start_time,
        end_time
    });
    return Import.findAll({
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
Import.totalRecords = ({
    keyword,
    stores,
    statuses,
    start_time,
    end_time
}) => {
    const options = filterConditions({
        keyword,
        stores,
        statuses,
        start_time,
        end_time
    });

    return Import.count({ where: options });
};

/**
 * Generate Table
 */
Import.sync({});

/**
 * @typedef Import
 */
export default Import;
