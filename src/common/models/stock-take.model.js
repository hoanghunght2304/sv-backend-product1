import httpStatus from 'http-status';
import moment from 'moment-timezone';
import { DataTypes, Model, Op } from 'sequelize';
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
class StockTake extends Model { }

StockTake.Statuses = {
    CHECKING: 'checking',
    CANCELLED: 'cancelled',
    CONFIRMED: 'confirmed'
};

StockTake.GroupTypes = {
    ITEM: 'item',
    OTHER: 'other',
    MATERIAL: 'material'
};

StockTake.Reasons = {
    KHAC: 'Khác',
    HU_HONG: 'Hư hỏng',
    TRA_HANG: 'Trả hàng'
};

/**
 * Stock Take Schema
 */
StockTake.init(
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

        /** Stock detail */
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
        total_actual: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_adjustment: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        status: {
            type: DataTypes.STRING(25),
            values: values(StockTake.Statuses),
            defaultValue: StockTake.Statuses.CHECKING
        },
        confirmed_at: {
            type: DataTypes.DATE(),
            defaultValue: null
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
        modelName: 'stock',
        tableName: 'tbl_stocks'
    }
);

/**
 * Register event emiter
 */
StockTake.EVENT_SOURCE = `${serviceName}.stock`;
StockTake.Events = {
    STOCK_CREATED: 'stock_created',
    STOCK_CANCELLED: 'stock_cancelled',
    STOCK_CONFIRMED: 'stock_confirmed'
};

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
StockTake.addHook('beforeCreate', async (model) => {
    const stock = model;
    stock.id = await StockTake.generateStockId();
    return stock;
});

StockTake.addHook('afterCreate', (model, options) => {
    const { params } = options;
    const dataValue = model.dataValues;

    /**
     * case 1: add item to stock detail
     */
    eventBus.emit(
        StockTake.Events.STOCK_CREATED,
        {
            user: dataValue.created_by,
            items: params.items,
            stock: dataValue
        }
    );
});

StockTake.addHook('afterUpdate', (model, options) => {
    const { params } = options;
    const newModel = model.dataValues;
    const oldModel = model._previousDataValues;
    const dataChanged = keys(model._changed);

    /**
     * case 1: log to event-store when Stock bill updated
     * case 2: update quantity to store when Stock bill comfirmed
     */
    switch (params.event_source) {
        case StockTake.Events.STOCK_CONFIRMED:
            eventBus.emit(
                params.event_source,
                {
                    user: pick(params.updated_by, ['id', 'name']),
                    items: params.items,
                    stock: newModel
                }
            );
            break;

        default: {
            const message = params.event_source === StockTake.Events.STOCK_CANCELLED
                ? 'đã hủy phiếu kiểm kho:'
                : 'đã cập nhật thông tin phiếu kiểm kho:';

            eventBus.emit(
                AppEvent.Events.APP_EVENT_UPDATED,
                {
                    source: 'stocks',
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
StockTake.transform = (model) => {
    const transformed = {};
    const fields = [
        /** attributes */
        'id',
        'note',
        'reason',

        /** detail */
        'store',
        'items',
        'status',

        /** quantity */
        'total_quantity',
        'total_actual',
        'total_adjustment',

        /** row management */
        'confirmed_at',
        'created_by',
        'created_at',
        'updated_at'
    ];

    fields.forEach((field) => {
        transformed[field] = model[field];
    });

    transformed.created_at = moment(model.created_at).unix();
    transformed.updated_at = moment(model.updated_at).unix();
    transformed.confirmed_at = moment(model.confirmed_at).unix();
    return transformed;
};

/**
 * Get all changed properties
 *
 * @public
 * @param {Object} data newModel || oleModel
 */
StockTake.getChangedProperties = ({ newModel, oldModel }) => {
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
 * Generate Stock Id
 */
StockTake.generateStockId = async () => {
    const stock = await StockTake.findOne({
        order: [
            ['created_at', 'desc']
        ]
    });
    if (!stock) return '1000';
    return parseInt(stock.id, 10) + 1;
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

    if (options.start_time && options.end_time) {
        options.start_time.setHours(0, 0, 0, 0); options.end_time.setHours(23, 59, 59, 999);
    }

    /** begin: setup condition */
    if (options.statuses) conditions.status = { [Op.in]: options.statuses.split(',') };
    if (options.stores) conditions['store.id'] = { [Op.in]: options.stores.split(',') };
    if (options.keyword) conditions.id = { [Op.iLike]: `%${options.keyword}%` };
    if (options.start_time && options.end_time && options.by_date === 'create') conditions.created_at = { [Op.gte]: options.start_time, [Op.lte]: options.end_time };
    if (options.start_time && options.end_time && options.by_date === 'update') conditions.updated_at = { [Op.gte]: options.start_time, [Op.lte]: options.end_time };

    return conditions;
}

/**
 * Load sort query
 * @param {*} sort_by
 * @param {*} order_by
 */
function sortConditions({ sort_by, order_by }) {
    let sort = null;
    switch (sort_by) {
        case 'create':
            sort = ['created_at', order_by];
            break;
        case 'update':
            sort = ['updated_at', order_by];
            break;
        default: sort = ['created_at', 'DESC'];
            break;
    }
    return sort;
}


/**
 * Get Stock By Id
 *
 * @public
 * @param {String} id
 */
StockTake.get = async (id) => {
    try {
        const result = await sequelize.query(`
            SELECT 
                s.*,
                jsonb_agg( 
                    jsonb_build_object(
                        'id', p.id,
                        'name', p.name,
                        'properties', p.properties,
                        'category_id', p.category_id,
                        'category_two_id', p.category_two_id,
                        'category_three_id', p.category_three_id,
                        'total_actual', d.total_actual,
                        'total_quantity', d.total_quantity,
                        'total_adjustment', d.total_adjustment
                    )
                ) as items
            FROM tbl_stocks AS s
                INNER JOIN tbl_stock_details AS d ON s.id = d.stock_id
                INNER JOIN tbl_products AS p ON p.id = d.item_id
            WHERE s.id = '${id}'
            GROUP BY s.id`
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
 * List Stocks in descending order of 'createdAt' timestamp.
 *
 * @param {number} skip - Number of users to be skipped.
 * @param {number} limit - Limit number of users to be returned.
 * @returns {Promise<Stock[]>}
 */
StockTake.list = async ({
    keyword,
    stores,
    statuses,
    by_date,
    start_time,
    end_time,
    sort_by,
    order_by,
    skip = 0,
    limit = 20,
}) => {
    const options = filterConditions({
        keyword,
        stores,
        statuses,
        by_date,
        start_time,
        end_time
    });
    const sort = sortConditions({ sort_by, order_by });
    return StockTake.findAll({
        where: options,
        order: [sort],
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
StockTake.totalRecords = ({
    keyword,
    stores,
    statuses,
    by_date,
    start_time,
    end_time
}) => {
    const options = filterConditions({
        keyword,
        stores,
        statuses,
        by_date,
        start_time,
        end_time
    });

    return StockTake.count({ where: options });
};

/**
 * Generate Table
 */
StockTake.sync({});

/**
 * @typedef StockTake
 */
export default StockTake;
