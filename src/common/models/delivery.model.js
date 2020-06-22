import { Model, DataTypes, Op } from 'sequelize';
import { values, omitBy, isNil } from 'lodash';
import moment from 'moment-timezone';
import httpStatus from 'http-status';

import postgres from '../../config/postgres';
import { serviceName, env } from '../../config/vars';
import eventBus from '../services/events/event-bus';
import APIException from '../utils/APIException';
import messages from '../../config/messages';

import DeliveryItem from './delivery-item.model';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class Delivery extends Model { }

Delivery.Statuses = {
    DELIVERING: 'delivering',
    CANCELLED: 'cancelled',
    DELIVERED: 'delivered'
};

Delivery.Methods = {
    SHIP_COD: 'ship_cod',
    RECEIVE_AT_STORE: 'receive_at_store'
};

/**
 * Delivery Schema
 * @public
 */
Delivery.init(
    {
        id: {
            type: DataTypes.STRING(24),
            primaryKey: true
        },
        note: {
            type: DataTypes.STRING(255),
            defaultValue: null
        },
        order_id: {
            type: DataTypes.STRING(50),
            allowNull: false
        },

        // delivery management
        method: {
            type: DataTypes.STRING(50),
            values: values(Delivery.Methods),
            defaultValue: Delivery.Methods.RECEIVE_AT_STORE
        },
        status: {
            type: DataTypes.STRING(50),
            values: values(Delivery.Statuses),
            defaultValue: Delivery.Statuses.DELIVERED
        },

        // 3RD API
        service: {
            type: DataTypes.JSONB,
            defaultValue: null
        },

        // payment management
        total_price: {
            type: DataTypes.DECIMAL,
            defaultValue: 0
        },
        total_quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },

        // row management
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
        modelName: 'delivery',
        tableName: 'tbl_deliveries'
    }
);

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
Delivery.addHook('beforeCreate', async (model) => {
    // eslint-disable-next-line no-param-reassign
    model.id = await Delivery.generateId();
    return model;
});

Delivery.addHook('afterCreate', (model, options) => {
    const { dataValues } = model;
    const { products } = options;

    eventBus.emit(
        Delivery.Events.DELIVERY_CREATED,
        {
            model: dataValues,
            products: products
        }
    );
});

/**
 * Register event emiter
 */
Delivery.EVENT_SOURCE = `${serviceName}.delivery`;
Delivery.Events = {
    DELIVERY_CREATED: `${serviceName}.delivery.created`,
    DELIVERY_UPDATED: `${serviceName}.delivery.updated`
};


/**
 * Load query
 * @param {*} params
 */
function filterConditions(params) {
    const options = omitBy(params, isNil);

    // TODO: load condition
    if (options.methods) {
        options.method = {
            [Op.in]: options.methods.split(',')
        };
    }
    delete options.methods;

    if (options.statuses) {
        options.status = {
            [Op.in]: options.statuses.split(',')
        };
    }
    delete options.statuses;

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
Delivery.transform = (model) => {
    const transformed = {};
    const fields = [
        'id',
        'note',
        'order_id',

        // process
        'method',
        'status',

        // 3RD API
        'service',

        // additional
        'products',

        // payment
        'total_price',
        'total_quantity',

        // manager
        'created_by',
        'created_at',
        'updated_at'
    ];

    fields.forEach((field) => {
        transformed[field] = model[field];
    });

    transformed.total_price = +model.total_price;
    transformed.total_quantity = +model.total_quantity;

    transformed.created_at = moment(model.created_at).unix();
    transformed.updated_at = moment(model.updated_at).unix();
    return transformed;
};

/**
 * Detail
 *
 * @public
 * @param {string} id
 */
Delivery.get = async (id) => {
    try {
        const result = await Delivery.findByPk(
            id
        );
        if (!result) {
            throw new APIException({
                status: httpStatus.NOT_FOUND,
                message: messages.NOT_FOUND
            });
        }

        // transform data
        const { dataValues } = result;
        dataValues.products = await DeliveryItem.list({
            delivery_id: id
        });

        return dataValues;
    } catch (ex) {
        throw ex;
    }
};

/**
 * List records in descending order of 'createdAt' timestamp.
 *
 * @param {number} skip - Number of records to be skipped.
 * @param {number} limit - Limit number of records to be returned.
 * @returns {Promise<Supplider[]>}
 */
Delivery.list = async ({
    methods,
    statuses,
    order_id,

    // sort
    sort_by,
    order_by,
    skip = 0,
    limit = 20,
}) => {
    const options = filterConditions({
        methods,
        statuses,
        order_id
    });
    const sort = sortConditions({
        sort_by,
        order_by
    });
    return Delivery.findAll({
        where: options,
        order: [sort],
        offset: skip,
        limit: limit
    });
};

/**
 * Total records.
 *
 * @param {number} skip - Number of records to be skipped.
 * @param {number} limit - Limit number of records to be returned.
 * @returns {Promise<Number>}
 */
Delivery.totalRecords = ({
    methods,
    statuses,
    order_id
}) => {
    const options = filterConditions({
        methods,
        statuses,
        order_id
    });
    return Delivery.count({
        where: options
    });
};

/**
 * Generate id
 * @private
 */
Delivery.generateId = async () => {
    const model = await Delivery.findOne({
        order: [['created_at', 'desc']]
    });
    if (model) {
        const id = model.id;
        const nextId = parseInt(
            id.substring(1, id.length), 10
        );
        return id.substring(0, id.length - nextId.toString().length) + (nextId + 1);
    }

    return 'S000000000';
};

/**
 * Generate Table
 */
Delivery.sync({
    alter: true,
    logging: env === 'development'
});

/**
 * @typedef Delivery
 */
export default Delivery;
