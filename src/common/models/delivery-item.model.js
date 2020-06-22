import { Model, DataTypes, Op } from 'sequelize';
import { omitBy, isNil } from 'lodash';

import postgres from '../../config/postgres';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class DeliveryItem extends Model { }

/**
 * Delivery Detail Schema
 * @public
 */
DeliveryItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        delivery_id: {
            type: DataTypes.STRING(24),
            allowNull: false
        },
        product_id: {
            type: DataTypes.STRING(24),
            allowNull: false
        },
        product_name: {
            type: DataTypes.STRING(100),
            defaultValue: null
        },
        total_price: {
            type: DataTypes.INTEGER,
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
        modelName: 'delivery_item',
        tableName: 'tbl_delivery_items'
    }
);


/**
 * Load query
 * @param {*} params
 */
function filterConditions(params) {
    const options = omitBy(params, isNil);
    options.delivery_id = { [Op.ne]: null };
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
DeliveryItem.transform = (model) => {
    const transformed = {};
    transformed.id = model.product_id;
    transformed.name = model.product_name;
    transformed.total_price = +model.total_price;
    transformed.total_quantity = +model.total_quantity;
    return transformed;
};


/**
 * List records in descending order of 'created_at' timestamp.
 *
 * @param {number} skip - Number of records to be skipped.
 * @param {number} limit - Limit number of records to be returned.
 * @returns {Promise<Supplider[]>}
 */
DeliveryItem.list = async ({
    sort_by,
    order_by,
    skip = 0,
    limit = 20,
    delivery_id
}) => {
    const options = filterConditions({
        delivery_id
    });
    const sort = sortConditions({
        sort_by,
        order_by
    });
    return DeliveryItem.findAll({
        where: options,
        order: [sort],
        offset: skip,
        limit: limit
    });
};


/**
 * Generate Table
 */
DeliveryItem.sync({});

/**
 * @typedef DeliveryItem
 */
export default DeliveryItem;
