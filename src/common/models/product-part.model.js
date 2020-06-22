import httpStatus from 'http-status';
import moment from 'moment-timezone';
import { Model, DataTypes } from 'sequelize';
import { isEqual, includes } from 'lodash';

import postgres from '../../config/postgres';
import { serviceName, env } from '../../config/vars';
import APIException from '../utils/APIException';
import messages from '../../config/messages';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class ProductPart extends Model { }

/**
 * Part Schema
 * @public
 */
ProductPart.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        product_id: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        material_id: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        exported_at: {
            type: DataTypes.DATE,
            defaultValue: null
        },
        exported_by: {
            type: DataTypes.JSONB,
            defaultValue: null
        },

        // manager
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        created_by: {
            type: DataTypes.JSONB,
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
        modelName: 'ProductPart',
        tableName: 'tbl_product_parts'
    }
);

/**
 * Register event emiter
 */
ProductPart.EVENT_SOURCE = `${serviceName}.product-part`;
ProductPart.Events = {};

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
ProductPart.addHook('afterCreate', () => { });

ProductPart.addHook('afterBulkUpdate', () => { });

ProductPart.addHook('afterDestroy', () => { });

/**
 * Transform mongoose model to expose object
 */
ProductPart.transform = (model) => {
    const transformed = {};
    const fields = [
        /** for info */
        'id',
        'product_id',
        'material_id',
        'exported_at',
        'exported_by',

        /** for collection manager */
        'is_active',
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
 * Get all changed properties
 *
 * @public
 * @param {Object} data newModel || oleModel
 */
ProductPart.getChangedProperties = ({ newModel, oldModel }) => {
    const changedProperties = [];
    const allChangableProperties = [
        /** attributes */
        'product_id',
        'material_id',
        'exported_at',
        'exported_by'
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
 * Get Detail By ID
 *
 * @public
 * @param {Integer} id
 */
ProductPart.getDetailById = async (id) => {
    try {
        const part = await ProductPart.findByPk(id);
        if (!part) {
            throw new APIException({
                status: httpStatus.NOT_FOUND,
                message: messages.NOT_FOUND
            });
        }
        return part;
    } catch (ex) {
        throw (ex);
    }
};

/**
 * Check Duplicate ID
 *
 * @public
 * @param {Integer} id
 */
ProductPart.checkDuplicateId = async (id) => {
    try {
        const part = await ProductPart.findByPk(id);
        if (part) {
            throw new APIException({
                status: httpStatus.BAD_REQUEST,
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
ProductPart.sync({
    alter: true,
    logging: env === 'development'
});

/**
 * @typedef ProductPart
 */
export default ProductPart;
