import { Model, DataTypes, Op } from 'sequelize';
import { values, omitBy, isNil } from 'lodash';
import moment from 'moment-timezone';

import { env } from '../../config/vars';
import postgres from '../../config/postgres';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class Payment extends Model { }

Payment.Methods = {
    TT_TIEN_MAT: 1,
    TT_QUET_THE: 2,
    TT_THE_ATM: 3,
    TT_THE_VISA: 4
};

Payment.Sources = {
    ERP: 'erp',
    EC: 'ec'
};

/**
 * Payment History Schema
 * @public
 */
Payment.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
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
        store: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {
                id: null,
                name: null,
                phone: null
            }
        },

        // payment
        method: {
            type: DataTypes.INTEGER,
            values: values(Payment.Methods),
            defaultValue: Payment.Methods.TT_TIEN_MAT
        },
        card: {
            type: DataTypes.JSONB,
            defaultValue: {
                name: null,
                number: null,
                expiry: null,
                cvc: null
            }
        },
        total_price: {
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

        // row management
        device: {
            type: DataTypes.STRING(24),
            defaultValue: null
        },
        source: {
            type: DataTypes.STRING(20),
            defaultValue: Payment.Sources.ERP
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
        modelName: 'payment',
        tableName: 'tbl_payments'
    }
);

/**
 * Load query
 * @param {*} params
 */
function filterConditions(params) {
    const options = omitBy(params, isNil);
    options.is_active = true;

    // TODO: load condition
    if (options.methods) {
        options.method = {
            [Op.in]: options.methods.split(',')
        };
    }
    delete options.methods;

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
Payment.transform = (model) => {
    const transformed = {};
    const fields = [
        'id',
        'note',
        'order_id',
        'store',

        // price
        'method',
        'card',
        'total_paid',
        'total_unpaid',
        'total_price',

        // manager
        'created_by',
        'created_at',
        'updated_at'
    ];

    fields.forEach((field) => {
        transformed[field] = model[field];
    });

    transformed.total_paid = +model.total_paid;
    transformed.total_unpaid = +model.total_unpaid;
    transformed.total_price = +model.total_price;
    transformed.created_at = moment(model.created_at).unix();
    transformed.updated_at = moment(model.updated_at).unix();
    return transformed;
};


/**
 * List payments in descending order of 'createdAt' timestamp.
 *
 * @param {number} skip - Number of payments to be skipped.
 * @param {number} limit - Limit number of payments to be returned.
 * @returns {Promise<Supplider[]>}
 */
Payment.list = async ({
    methods,
    order_id,

    // sort
    sort_by,
    order_by,
    skip = 0,
    limit = 20,
}) => {
    const options = filterConditions({
        methods,
        order_id
    });
    const sort = sortConditions({
        sort_by,
        order_by
    });
    return Payment.findAll({
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
Payment.totalRecords = ({
    methods,
    order_id
}) => {
    const options = filterConditions({
        methods,
        order_id
    });
    return Payment.count({
        where: options
    });
};


/**
 * Generate Table
 */
Payment.sync({
    alter: true,
    logging: env === 'development'
});

/**
 * @typedef Payment
 */
export default Payment;
