import httpStatus from 'http-status';
import moment from 'moment-timezone';
import { Model, DataTypes } from 'sequelize';
import { isEqual, includes } from 'lodash';

import postgres from '../../config/postgres';
import { serviceName } from '../../config/vars';
import APIException from '../utils/APIException';
import messages from '../../config/messages';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class Category extends Model { }

/**
 * Category Schema
 * @public
 */
Category.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        parent_id: {
            type: DataTypes.INTEGER,
            defaultValue: null
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        desciption: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        group: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        /** for collection manager */
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
        modelName: 'Category',
        tableName: 'tbl_categories'
    }
);

/**
 * Register event emiter
 */
Category.EVENT_SOURCE = `${serviceName}.category`;
Category.Events = {};

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
Category.addHook('afterCreate', () => { });

Category.addHook('afterUpdate', () => { });

Category.addHook('afterDestroy', () => { });

/**
 * Transform mongoose model to expose object
 */
Category.transform = (model) => {
    const transformed = {};
    const fields = [
        /** for info */
        'id',
        'parent_id',
        'name',
        'description',
        'group',

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
Category.getChangedProperties = ({ newModel, oldModel }) => {
    const changedProperties = [];
    const allChangableProperties = [
        /** attributes */
        'parent_id',
        'name',
        'description',
        'group'
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
Category.getDetailById = async (id) => {
    try {
        const category = await Category.findByPk(id);
        if (!category) {
            throw new APIException({
                status: httpStatus.NOT_FOUND,
                message: messages.NOT_FOUND
            });
        }
        return category;
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
Category.checkDuplicateId = async (id) => {
    try {
        const categoty = await Category.findByPk(id);
        if (categoty) {
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
Category.sync({});

/**
 * @typedef Category
 */
export default Category;
