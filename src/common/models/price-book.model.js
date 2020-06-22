/* eslint-disable indent */
import httpStatus from 'http-status';
import moment from 'moment-timezone';
import { DataTypes, Model, Op } from 'sequelize';
import { isEqual, includes, omitBy, isNil } from 'lodash';

import postgres from '../../config/postgres';
import { serviceName, env } from '../../config/vars';
import APIException from '../utils/APIException';
import messages from '../../config/messages';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class PriceBook extends Model { }

PriceBook.init(
    {
        id: {
            type: DataTypes.STRING(24),
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(500),
            defaultValue: null
        },
        categories: {
            type: DataTypes.JSONB,
            allowNull: false
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
        tableName: 'tbl_price_books'
    }
);

/**
 * Register event emiter
 */
PriceBook.EVENT_SOURCE = `${serviceName}.price-book`;
PriceBook.Events = {
    PRICE_BOOK_CREATE: `${serviceName}.price-book.create`,
    PRICE_BOOK_UPDATE: `${serviceName}.price-book.update`
};

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
PriceBook.addHook('afterCreate', () => {
    // do something
});

PriceBook.addHook('afterUpdate', () => {
    // do something
});

/**
 * Load query
 * @param {*} params
 */
function filterConditions(params) {
    const options = omitBy(params, isNil);
    options.is_active = true;

    // TODO: load condition
    if (options.keyword) {
        options[Op.or] = [
            {
                id: { [Op.iLike]: `%${options.keyword}%` }
            },
            {
                name: { [Op.iLike]: `%${options.keyword}%` }
            }
        ];
    }
    delete options.keyword;

    if (options.ids) {
        options.id = {
            [Op.in]: options.ids
        };
    }
    delete options.ids;

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
 * Get changed properties
 * @public
 */
PriceBook.getChangedProperties = ({ newModel, oldModel }) => {
    const changedProperties = [];
    const allChangableProperties = [
        'name',
        'description',
        'categories'
    ];

    /** get all changable properties */
    allChangableProperties.forEach((field) => {
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
 * Methods
 */
PriceBook.transform = (model) => {
    const transformed = {};
    const fields = [
        // attribute
        'id',
        'name',
        'description',
        'categories',
        'attributes',

        // manager
        'created_by',
        'created_at',
        'updated_at'
    ];

    fields.forEach((field) => {
        transformed[field] = model[field];
    });

    transformed.created_at = moment(model.created_at).unix();
    transformed.updated_at = moment(model.updated_at).unix();
    return transformed;
};

/**
 * Get list Attributes
 *
 * @public
 * @param {Parameters} params
 */
PriceBook.list = async ({
    ids,
    keyword,
    sort_by,
    order_by,
    skip = 0,
    limit = 10,
}) => {
    try {
        const options = filterConditions({ ids, keyword });
        const sort = sortConditions({ sort_by, order_by });
        const result = await PriceBook.findAll({
            where: options,
            order: [sort],
            offset: skip,
            limit: limit
        });
        return result;
    } catch (ex) {
        throw (ex);
    }
};

/**
 * Count list filters
 *
 * @public
 * @param {Parameters} params
 */
PriceBook.countQueries = async ({ keyword }) => {
    try {
        const options = filterConditions({ keyword });
        const totalRecords = await PriceBook.count({ where: options });
        return totalRecords;
    } catch (ex) {
        throw (ex);
    }
};

/**
 *
 * @public
 * @param {String} id
 */
PriceBook.get = async (id) => {
    try {
        const data = await PriceBook.findByPk(id);
        if (!data) {
            throw new APIException({
                status: httpStatus.NOT_FOUND,
                message: messages.NOT_FOUND
            });
        }
        return data;
    } catch (ex) {
        throw (ex);
    }
};

/**
 * Check duplicate
 * @param {*} id
 */
PriceBook.checkDuplicate = async (id) => {
    try {
        const data = await PriceBook.findByPk(
            id
        );
        if (data) {
            throw new APIException({
                status: httpStatus.CONFLICT,
                message: messages.CONFLICT
            });
        }
        return true;
    } catch (ex) {
        throw (ex);
    }
};

PriceBook.sync({
    alter: true,
    logging: env === 'development'
});

/**
 * @typedef PriceBook
 */
export default PriceBook;
