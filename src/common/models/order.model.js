/* eslint-disable no-param-reassign */
/* eslint-disable indent */
import httpStatus from 'http-status';
import moment from 'moment-timezone';
import { Model, DataTypes, Op } from 'sequelize';
import { isEqual, includes, values, omitBy, isNil, pick, keys } from 'lodash';

import postgres from '../../config/postgres';
import { serviceName, env } from '../../config/vars';
import APIException from '../utils/APIException';
import messages from '../../config/messages';
import eventBus from '../services/events/event-bus';

import Payment from './payment.model';
import Delivery from './delivery.model';
import OrderDetail from './order-item.model';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class Order extends Model { }

Order.Types = {
    TAILOR: 'tailor',
    UNIFORM: 'uniform',
    SERVICE: 'service',
    ECOMMERCE: 'ecommerce',
    TAILOR_AT_HOME: 'tailor_at_home',
    SALE_AVAILABLE: 'sale_available',
};

Order.Statuses = {
    PENDING: 'pending',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed'
};

Order.PaymentMethods = {
    TT_TIEN_MAT: 1,
    TT_QUET_THE: 2,
    TT_THE_ATM: 3,
    TT_THE_VISA: 4
};

Order.ShipMethods = {
    COD: 1,
    STORE: 2,
    STANDARD: 3
};

Order.Currencies = {
    VND: 'vnd',
    USD: 'usd'
};

Order.Sources = {
    SMS: 'sms',
    CALL: 'call',
    EMAIL: 'email',
    SOCIAL: 'social',
    WEBSITE: 'website',
    VOUCHER: 'voucher'
};

Order.DiscountTypes = {
    PERCENT: 1,
    CASH: 2
};

/**
 * Order Schema
 * @public
 */
Order.init(
    {
        // attributes
        id: {
            type: DataTypes.STRING(20),
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            defaultValue: null
        },
        type: {
            type: DataTypes.STRING(50),
            values: values(Order.Types),
            allowNull: false
        },
        images: {
            type: DataTypes.ARRAY(
                DataTypes.STRING(255)
            ),
            defaultValue: []
        },
        note: {
            type: DataTypes.JSONB,
            defaultValue: {
                system: null,
                customer: null
            }
        },

        // owner and customer
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
        customer: {
            type: DataTypes.JSONB,
            defaultValue: {
                id: null,
                name: null,
                phone: null,
                address: null
            }
        },

        // process management
        status: {
            type: DataTypes.STRING(25),
            values: values(Order.Statuses),
            defaultValue: Order.Statuses.PENDING
        },
        deadline: {
            type: DataTypes.DATE,
            defaultValue: null
        },
        measure_process: {
            type: DataTypes.JSONB,
            defaultValue: {
                complete_by: null,
                complete_at: null, // Ngày đo
                scheduled_at: null, // Ngày hẹn đo
                point: 0
            }
        },
        consult_process: {
            type: DataTypes.JSONB,
            defaultValue: {
                complete_by: null,
                complete_at: null,
                point: 0
            }
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

        // payment management
        currency: {
            type: DataTypes.STRING(25),
            values: values(Order.Currencies),
            defaultValue: Order.Currencies.VND
        },
        price_before_discount: {
            type: DataTypes.DECIMAL,
            defaultValue: 0
        },
        total_coin: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_point: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_price: {
            type: DataTypes.DECIMAL,
            defaultValue: 0
        },
        total_discount: {
            type: DataTypes.DECIMAL,
            defaultValue: 0
        },
        total_paid: {
            type: DataTypes.DECIMAL,
            defaultValue: 0
        },
        total_unpaid: {
            type: DataTypes.DECIMAL,
            defaultValue: 0
        },
        payment_method: {
            type: DataTypes.INTEGER,
            values: values(Order.PaymentMethods),
            defaultValue: Order.PaymentMethods.TT_TIEN_MAT
        },
        shipping_method: {
            type: DataTypes.INTEGER,
            values: values(Order.ShipMethods),
            defaultValue: Order.ShipMethods.STANDARD
        },

        // manager
        source: {
            type: DataTypes.STRING(50),
            values: values(Order.Sources),
            defaultValue: null
        },
        device: {
            type: DataTypes.STRING(255),
            defaultValue: 'unknown'
        },
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
        tableName: 'tbl_orders'
    }
);

/**
 * Register event emiter
 */
Order.EVENT_SOURCE = `${serviceName}.order`;
Order.Events = {
    ORDER_CREATED: `${serviceName}.order.created`,
    ORDER_UPDATED: `${serviceName}.order.updated`,
    ORDER_CANCELLED: `${serviceName}.order.cancelled`,
    ORDER_PAYMENTED: `${serviceName}.order.paymented`
};

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
Order.addHook('beforeCreate', async (model) => {
    // eslint-disable-next-line no-param-reassign
    model.id = await Order.generateId();
    return model;
});

Order.addHook('afterCreate', (model, options) => {
    const { dataValues } = model;
    const { products } = options;

    eventBus.emit(
        Order.Events.ORDER_CREATED,
        {
            model: dataValues,
            products: products
        }
    );
});

Order.addHook('afterUpdate', (model, options) => {
    // parse data
    const newModel = model.dataValues;
    const oldModel = model._previousDataValues;
    const dataChanged = keys(model._changed);

    // include data
    const { user, event } = options;

    switch (event) {
        case Order.Events.ORDER_UPDATED: {
            eventBus.emit(
                Order.Events.ORDER_UPDATED,
                {
                    user: user,
                    model: {
                        id: model.id,
                        old: pick(oldModel, dataChanged),
                        new: pick(newModel, dataChanged)
                    }
                }
            );
            break;
        }

        case Order.Events.ORDER_CANCELLED: {
            eventBus.emit(
                Order.Events.ORDER_CANCELLED,
                {
                    user: user,
                    model: {
                        id: model.id,
                        old: pick(oldModel, dataChanged),
                        new: pick(newModel, dataChanged)
                    }
                }
            );
            break;
        }

        case Order.Events.ORDER_PAYMENTED: {
            const { params } = options;
            eventBus.emit(
                Order.Events.ORDER_PAYMENTED,
                {
                    user,
                    params,
                    model: newModel
                }
            );
            break;
        }
        default:
            break;
    }
});

/**
 * Check min or max in condition
 * @param {*} options
 * @param {*} field
 * @param {*} type
 */
function checkMinMaxOfConditionFields(options, field, type = 'Number') {
    let _min = null;
    let _max = null;

    // Transform min max
    if (type === 'Date') {
        const start = new Date(options[`min_${field}`]);
        _min = start.setHours(0, 0, 0, 0);

        const end = new Date(options[`max_${field}`]);
        _max = end.setHours(23, 59, 59, 999);
    } else {
        _min = parseFloat(options[`min_${field}`]);
        _max = parseFloat(options[`max_${field}`]);
    }

    // Transform condition
    if (
        !isNil(options[`min_${field}`]) ||
        !isNil(options[`max_${field}`])
    ) {
        if (
            options[`min_${field}`] &&
            !options[`max_${field}`]
        ) {
            options[field] = {
                [Op.gte]: _min
            };
        } else if (
            !options[`min_${field}`] &&
            options[`max_${field}`]
        ) {
            options[field] = {
                [Op.lte]: _max
            };
        } else {
            options[field] = {
                [Op.gte]: _min || 0,
                [Op.lte]: _max || 0
            };
        }
    }

    // Remove first condition
    delete options[`max_${field}`];
    delete options[`min_${field}`];
}

/**
 * Load query
 * @param {*} params
 */
function filterConditions(params) {
    const options = omitBy(params, isNil);
    options.is_active = true;

    // TODO: load condition
    if (options.types) {
        options.type = {
            [Op.in]: options.types.split(',')
        };
    }
    delete options.types;

    if (options.stores) {
        options['store.id'] = {
            [Op.in]: options.stores.split(',')
        };
    }
    delete options.stores;

    if (options.sources) {
        options.source = {
            [Op.in]: options.sources.split(',')
        };
    }
    delete options.sources;

    if (options.statuses) {
        options.status = {
            [Op.in]: options.statuses.split(',')
        };
    }
    delete options.statuses;

    if (options.created_by) {
        options['created_by.name'] = options.created_by;
    }
    delete options.created_by;

    if (
        options.min_created_at &&
        options.max_created_at
    ) {
        checkMinMaxOfConditionFields(options, 'created_at', 'Date');
    }

    if (
        options.min_total_paid &&
        options.max_total_paid
    ) {
        checkMinMaxOfConditionFields(options, 'total_paid', 'Date');
    }

    if (
        options.min_total_unpaid &&
        options.max_total_unpaid
    ) {
        checkMinMaxOfConditionFields(options, 'total_unpaid', 'Date');
    }

    if (
        options.min_total_price &&
        options.max_total_price
    ) {
        checkMinMaxOfConditionFields(options, 'total_price', 'Date');
    }

    // $search
    if (options.keyword) {
        options[Op.or] = [
            {
                id: {
                    [Op.iLike]: `%${options.keyword}%`
                }
            },
            {
                'customer.name': {
                    [Op.iLike]: `%${options.keyword}%`
                }
            },
            {
                'customer.phone': {
                    [Op.iLike]: `%${options.keyword}%`
                }
            }
        ];
    }
    delete options.keyword;

    return options;
}

/**
 * Load sort query
 * @param {*} sort_by
 * @param {*} order_by
 */
function sortConditions({ sort_by, order_by }) {
    let sort = null;
    switch (sort_by) {
        case 'created_at':
            sort = ['created_at', order_by];
            break;
        case 'updated_at':
            sort = ['updated_at', order_by];
            break;
        default: sort = ['created_at', 'DESC'];
            break;
    }
    return sort;
}

/**
 * Transform postgres model to expose object
 */
Order.transform = (model) => {
    const transformed = {};
    const fields = [
        // attributes
        'id',
        'name',
        'type',
        'images',
        'note',

        // owner
        'store',
        'customer',

        // process
        'status',
        'deadline',
        'measure_process',
        'consult_process',
        'receive_process',
        'preview_process',

        // addintional
        'products',
        'payments',
        'deliveries',

        // payment
        'currency',
        'price_before_discount',
        'total_discount',
        'total_coin',
        'total_point',
        'total_price',
        'total_paid',
        'total_unpaid',
        'payment_method',

        // manager
        'source',
        'device',
        'created_by',
        'created_at',
        'updated_at'
    ];

    fields.forEach((field) => {
        transformed[field] = model[field];
    });

    transformed.deadline = model.deadline
        ? moment(model.deadline).unix()
        : null;
    transformed.measure_process.complete_at = model.measure_process.complete_at
        ? moment(model.measure_process.complete_at).unix()
        : null;
    transformed.measure_process.scheduled_at = model.measure_process.scheduled_at
        ? moment(model.measure_process.scheduled_at).unix()
        : null;
    transformed.consult_process.complete_at = model.consult_process.complete_at
        ? moment(model.consult_process.complete_at).unix()
        : null;
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

    transformed.price_before_discount = +model.price_before_discount;
    transformed.total_discount = +model.total_discount;
    transformed.total_price = +model.total_price;
    transformed.total_unpaid = +model.total_unpaid;
    transformed.total_paid = +model.total_paid;

    transformed.updated_at = moment(model.updated_at).unix();
    transformed.created_at = moment(model.created_at).unix();
    return transformed;
};

/**
 * Get all changed properties
 *
 * @public
 * @param {Object} data newModel || oleModel
 */
Order.getChangedProperties = ({ newModel, oldModel }) => {
    const changedProperties = [];
    const allChangableProperties = [
        // attributes
        'name',
        'note',
        'images',

        // process
        'deadline',
        'measure_process',
        'consult_process',
        'receive_process',
        'preview_process',

        // addintional
        'products'
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
 * Generate id
 *
 * @public
 */
Order.generateId = async () => {
    const order = await Order.findOne({
        order: [
            ['created_at', 'desc']
        ]
    });
    if (order) {
        const id = order.id;
        const nextId = parseInt(id.substring(1, id.length), 10);
        if (nextId < 9999999) {
            return id.substring(0, id.length - nextId.toString().length) + (nextId + 1);
        }
        return `${String.fromCharCode(id.charCodeAt(0) + 1)}0000000`;
    }

    return 'A0000000';
};

/**
 * Detail order
 *
 * @public
 * @param {string} id
 */
Order.get = async (id) => {
    try {
        const result = await Order.findByPk(
            id
        );
        if (!result) {
            throw new APIException({
                status: httpStatus.NOT_FOUND,
                message: messages.NOT_FOUND
            });
        }
        const { dataValues } = result;

        // load products
        const products = await OrderDetail.list({
            order_id: id
        });
        dataValues.products = products.map(
            x => OrderDetail.transform(x)
        );


        // load payments
        const payments = await Payment.list({
            order_id: id
        });
        dataValues.payments = payments.map(
            x => Payment.transform(x)
        );

        // load payments
        const deliveries = await Delivery.list({
            order_id: id
        });
        dataValues.deliveries = deliveries.map(
            x => Delivery.transform(x)
        );
        return dataValues;
    } catch (ex) {
        throw ex;
    }
};

/**
 * Get list order
 *
 * @public
 * @param {Parameters} params
 */
Order.list = async ({
    types,
    stores,
    sources,
    statuses,
    created_by,
    min_created_at,
    max_created_at,
    min_total_price,
    max_total_price,
    min_total_paid,
    max_total_paid,
    min_total_unpaid,
    max_total_unpaid,
    keyword,

    // sort
    sort_by,
    order_by,
    skip = 0,
    limit = 20,
}) => {
    const options = filterConditions({
        types,
        stores,
        sources,
        statuses,
        created_by,
        min_created_at,
        max_created_at,
        min_total_price,
        max_total_price,
        min_total_paid,
        max_total_paid,
        min_total_unpaid,
        max_total_unpaid,
        keyword
    });
    const sort = sortConditions({ sort_by, order_by, });
    return Order.findAll({
        where: options,
        order: [sort],
        offset: skip,
        limit: limit
    });
};

/**
 * Total quantity items list records
 *
 * @public
 * @param {Parameters} params
 */
Order.totalRecords = async ({
    types,
    stores,
    sources,
    statuses,
    created_by,
    min_created_at,
    max_created_at,
    min_total_price,
    max_total_price,
    min_total_paid,
    max_total_paid,
    min_total_unpaid,
    max_total_unpaid,
    keyword
}) => {
    try {
        const options = filterConditions({
            types,
            stores,
            sources,
            statuses,
            created_by,
            min_created_at,
            max_created_at,
            min_total_price,
            max_total_price,
            min_total_paid,
            max_total_paid,
            min_total_unpaid,
            max_total_unpaid,
            keyword
        });

        return Order.count({
            where: options
        });
    } catch (ex) {
        throw ex;
    }
};

/**
 * Check Duplicate OrderId
 *
 * @public
 * @param orderId
 */
Order.checkDuplicate = async (orderId) => {
    try {
        const order = await Order.findByPk(
            orderId
        );
        if (order) {
            throw new APIException({
                status: httpStatus.NOT_FOUND,
                message: messages.ITEM_EXISTS
            });
        }
        return true;
    } catch (ex) {
        throw (ex);
    }
};

/**
 * Generate table
 */
Order.sync({
    alter: true,
    logging: env === 'development'
});

/**
 * @typedef Order
 */
export default Order;
