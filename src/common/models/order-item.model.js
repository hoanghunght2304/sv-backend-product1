/* eslint-disable indent */
import httpStatus from 'http-status';
import moment from 'moment-timezone';
import { Model, DataTypes } from 'sequelize';
import { isEqual, includes, values, pick, keys } from 'lodash';

import postgres from '../../config/postgres';
import { serviceName, env } from '../../config/vars';
import APIException from '../utils/APIException';
import messages from '../../config/messages';
import eventBus from '../services/events/event-bus';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class OrderItem extends Model { }

/**
 * Currencies of order
 */
OrderItem.Currencies = {
    VND: 'VND',
    USD: 'USD'
};

/**
 * Statuses of items
 */
OrderItem.ItemStatuses = {
    PENDING: 'pending',
    CANCELLED: 'cancelled',
    CONFIRMED: 'confirmed',
    MEASURE: 'measure',
    CUTTING: 'cutting',
    PREPARING: 'preparing',
    SEWING: 'sewing',
    KCS_ONE: 'kcs_one',
    COMPLETING: 'completing',
    KCS_TWO: 'kcs_two',
    STORAGE: 'storage',
    DELIVERING: 'delivering',
    DELIVERED: 'delivered',
};

/**
 * Order Detail Schema
 * @public
 */
OrderItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        order_id: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        product_id: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        owner: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {
                id: null,
                name: null,
                phone: null,
                address: null
            }
        },
        note: {
            type: DataTypes.JSONB,
            defaultValue: {
                customer: null,
                system: null
            }
        },

        // payment management
        currency: {
            type: DataTypes.STRING(25),
            values: values(OrderItem.Currencies),
            defaultValue: OrderItem.Currencies.VND
        },
        price: {
            type: DataTypes.DECIMAL,
            defaultValue: 0
        },
        total_quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_discount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        price_before_discount: {
            type: DataTypes.DECIMAL,
            defaultValue: 0
        },
        total_service_price: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_price: {
            type: DataTypes.DECIMAL,
            defaultValue: 0
        },

        // owner design
        metrics: {
            type: DataTypes.JSONB,
            defaultValue: null
        },
        body_notes: {
            type: DataTypes.JSONB,
            defaultValue: null
        },

        // process management
        status: {
            type: DataTypes.STRING(25),
            values: values(OrderItem.ItemStatuses),
            defaultValue: OrderItem.ItemStatuses.PENDING
        },
        receive_process: {
            type: DataTypes.JSONB,
            defaultValue: {
                address: null,
                date: null
            }
        },
        preview_process: {
            type: DataTypes.JSONB,
            defaultValue: {
                address: null,
                one: null,
                two: null,
                three: null,
            }
        },
        cut_process: {
            type: DataTypes.JSONB,
            defaultValue: {
                complete_by: null,
                complete_at: null,
                point: 0
            }
        },
        prepare_process: {
            type: DataTypes.JSONB,
            defaultValue: {
                complete_by: null,
                complete_at: null,
                point: 0
            }
        },
        sew_process: {
            type: DataTypes.JSONB,
            defaultValue: {
                complete_by: null,
                complete_at: null,
                point: 0
            }
        },
        kcs_one_process: {
            type: DataTypes.JSONB,
            defaultValue: {
                complete_by: null,
                complete_at: null,
                point: 0
            }
        },
        complete_process: {
            type: DataTypes.JSONB,
            defaultValue: {
                complete_by: null,
                complete_at: null,
                point: 0
            }
        },
        kcs_two_process: {
            type: DataTypes.JSONB,
            defaultValue: {
                complete_by: null,
                complete_at: null,
                point: 0
            }
        },
        storage_process: {
            type: DataTypes.JSONB,
            defaultValue: {
                complete_by: null,
                complete_at: null,
                location: null
            }
        },

        // manager
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
        tableName: 'tbl_order_items'
    }
);

/**
 * Register event emiter
 */
OrderItem.EVENT_SOURCE = `${serviceName}.order-detail`;
OrderItem.Events = {
    PRODUCT_UPDATED: `${serviceName}.order-detail.updated`
};

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
OrderItem.addHook('afterUpdate', (model, options) => {
    // parse data
    const newModel = model.dataValues;
    const oldModel = model._previousDataValues;
    const dataChanged = keys(model._changed);

    // include data
    const { updated_by } = options;

    eventBus.emit(
        OrderItem.Events.PRODUCT_UPDATED,
        {
            user: updated_by,
            model: {
                id: model.id,
                old: pick(oldModel, dataChanged),
                new: pick(newModel, dataChanged)
            }
        }
    );
});

/**
 * Transform mongoose model to expose object
 */
OrderItem.transform = (model) => {
    const transformed = {};
    const fields = [
        // attribute
        'id',
        'name',
        'type',
        'description',
        'group',
        'images',
        'properties',
        'category_id',
        'category_two_id',
        'category_three_id',

        // dessign
        'fabric',
        'metrics',
        'body_notes',
        'design_styles',
        'design_extras',
        'design_advances',

        // info
        'owner',
        'note',

        // payment
        'currency',
        'origin_price',
        'price',
        'total_quantity',
        'total_discount',
        'price_before_discount',
        'total_service_price',
        'total_price',

        // process
        'status',
        'receive_process',
        'preview_process',
        'measure_process',
        'cut_process',
        'prepare_process',
        'sew_process',
        'kcs_one_process',
        'complete_process',
        'kcs_two_process',
        'storage_process',

        // manager
        'created_by',
        'created_at',
        'updated_at'
    ];

    fields.forEach((field) => {
        transformed[field] = model[field];
    });

    // process
    transformed.receive_process.date = model.receive_process.date
        ? moment(model.receive_process.date).unix()
        : null;
    transformed.preview_process.one = model.preview_process.one
        ? moment(model.preview_process.one).unix()
        : null;
    transformed.preview_process.two = model.preview_process.two
        ? moment(model.preview_process.two).unix()
        : null;
    transformed.preview_process.three = model.preview_process.three
        ? moment(model.preview_process.three).unix()
        : null;

    // production
    transformed.cut_process.complete_at = model.cut_process.complete_at
        ? moment(model.cut_process.complete_at).unix()
        : null;
    transformed.prepare_process.complete_at = model.prepare_process.complete_at
        ? moment(model.prepare_process.complete_at).unix()
        : null;
    transformed.sew_process.complete_at = model.sew_process.complete_at
        ? moment(model.sew_process.complete_at).unix()
        : null;
    transformed.kcs_one_process.complete_at = model.kcs_one_process.complete_at
        ? moment(model.kcs_one_process.complete_at).unix()
        : null;
    transformed.complete_process.complete_at = model.complete_process.complete_at
        ? moment(model.complete_process.complete_at).unix()
        : null;
    transformed.kcs_two_process.complete_at = model.kcs_two_process.complete_at
        ? moment(model.kcs_two_process.complete_at).unix()
        : null;
    transformed.storage_process.complete_at = model.storage_process.complete_at
        ? moment(model.storage_process.complete_at).unix()
        : null;

    transformed.price = +model.price;
    transformed.total_price = +model.total_price;
    transformed.price_before_discount = +model.price_before_discount;

    transformed.updated_at = moment(model.updated_at).unix();
    transformed.created_at = moment(model.created_at).unix();
    transformed.updated_at = moment(model.updated_at).unix();
    return transformed;
};

/**
 * Filter condition
 * @private
 */
const filterConditions = (params) => {
    let options = 'WHERE od.id IS NOT NULL ';

    // date filter
    if (params.start_time && params.end_time) {
        params.start_time.setHours(0, 0, 0, 0);
        params.end_time.setHours(23, 59, 59, 999);
    }
    if (
        params.start_time && params.end_time && params.by_date === 'create'
    ) options += 'AND (od.created_at::timestamp BETWEEN :start_time AND :end_time) ';
    if (
        params.start_time && params.end_time && params.by_date === 'update'
    ) options += 'AND (od.updated_at BETWEEN :start_time AND :end_time) ';
    if (
        params.start_time && params.end_time && params.by_date === 'try_one'
    ) options += 'AND ((od.preview_process ->> \'one\')::timestamp AT TIME ZONE \'UTC+7\' BETWEEN :start_time AND :end_time) ';
    if (
        params.start_time && params.end_time && params.by_date === 'try_two'
    ) options += 'AND ((od.preview_process ->> \'two\')::timestamp AT TIME ZONE \'UTC+7\' BETWEEN :start_time AND :end_time) ';

    // statuses
    if (params.statuses) {
        options += 'AND od.status IN (:statuses) ';
    }

    if (params.people_perform) {
        options += 'AND od.cut_process ->> \'complete_by\' IN (:people_perform) ';
    }

    // $search
    if (params.order_id) {
        options += `AND od.order_id = '${params.order_id}' `;
    }
    // if (params.product_id) {
    //     options += `AND od.product_id = '${params.product_id}'`;
    // }
    if (params.customer) {
        options += `AND (
            od.owner ->> 'name' ILIKE '%${params.customer}%' OR
            od.owner ->> 'phone'  ILIKE '%${params.customer}%'
        )`;
    }
    return options;
};

/**
 * Sort condition
 * @private
 */
const sortConditions = ({ order_by, sort_by }) => {
    let sorting = '';
    switch (sort_by) {
        case 'create':
            sorting += `ORDER BY p.created_at ${order_by}`;
            break;
        case 'update':
            sorting += `ORDER BY p.updated_at ${order_by}`;
            break;
        default:
            sorting += 'ORDER BY p.created_at DESC';
            break;
    }
    return sorting;
};

/**
 * Public filed respone
 * @private
 */
const PUBLIC_COLLUMS = () => {
    const collums = `
    p.id, 
    p.name,
    p.type,
    p.description,
    p.group,
    p.images,
    p.properties,
    p.category_id,
    p.category_two_id,
    p.category_three_id,
    
    p.fabric,
    p.design_styles,
    p.design_extras,
    p.design_advances,
    
    od.owner,
    od.note,
    
    od.currency,
    p.origin_price,
    od.price,
    od.total_price,
    od.total_discount,
    od.total_service_price,
    od.price_before_discount,
    od.total_quantity,
    
    od.status,
    od.receive_process,
    od.preview_process,
    od.cut_process,
    od.prepare_process,
    od.sew_process,
    od.kcs_one_process,
    od.complete_process,
    od.kcs_two_process,
    od.storage_process,
    
    od.metrics,
    od.body_notes,
    
    od.created_by,
    od.created_at,
    od.updated_at`;
    return collums;
};

/**
 * Get all changed properties
 *
 * @public
 * @param {Object} data newModel || oleModel
 */
OrderItem.getChangedProperties = ({ newModel, oldModel }) => {
    const changedProperties = [];
    const allChangableProperties = [
        'note',
        'metrics',
        'body_notes',

        // process
        'receive_process',
        'preview_process',
        'measure_process',
        'cut_process',
        'prepare_process',
        'sew_process',
        'kcs_one_process',
        'complete_process',
        'kcs_two_process',
        'storage_process'
    ];

    /** get all changable properties */
    Object.keys(newModel).forEach((field) => {
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
 * Get list product
 *
 * @public
 * @param {Parameters} params
 */
OrderItem.list = async (params) => {
    try {
        const queryConditions = filterConditions(params);
        const sortoptions = sortConditions(params);
        const collums = PUBLIC_COLLUMS();

        const result = await OrderItem.sequelize.query(`
            SELECT ${collums}
                FROM tbl_order_items AS od
                INNER JOIN tbl_products AS p ON p.id = od.product_id
            ${queryConditions}
            GROUP BY od.id, p.id
            ${sortoptions}
            OFFSET ${params.skip || 0}
            LIMIT ${params.limit || 500}`,
            {
                replacements: params
            });
        return result[0];
    } catch (ex) {
        throw (ex);
    }
};

/**
 * Count list records
 *
 * @public
 * @param {Parameters} params
 */
OrderItem.totalRecords = async (params) => {
    try {
        const queryConditions = filterConditions(params);
        const result = await OrderItem.sequelize.query(`
            SELECT COUNT(*)
                FROM tbl_order_items AS od
                INNER JOIN tbl_products AS p ON p.id = od.product_id
            ${queryConditions}
            GROUP BY od.id, p.id`,
            {
                replacements: params
            }
        );
        return result[1].rowCount || 0;
    } catch (ex) {
        throw ex;
    }
};

/**
 * Get detail
 *
 * @public
 * @param {Parameters} params
 */
OrderItem.get = async ({ orderId, productId }) => {
    try {
        const collums = PUBLIC_COLLUMS();
        const result = await OrderItem.sequelize.query(`
            SELECT ${collums}
                FROM tbl_order_items AS od
                INNER JOIN tbl_products AS p ON p.id = od.product_id
            WHERE od.product_id = '${productId}'
                AND od.order_id = '${orderId}'
            GROUP BY od.id, p.id
            LIMIT 1`
        );

        /** checking product */
        const product = result[0][0];
        if (!product) {
            throw new APIException({
                status: httpStatus.NOT_FOUND,
                message: messages.NOT_FOUND,
            });
        }
        return product;
    } catch (ex) {
        throw (ex);
    }
};

/**
 * Generate table
 */
OrderItem.sync({
    alter: true,
    logging: env === 'development'
});

/**
 * @typedef OrderItem
 */
export default OrderItem;
