import httpStatus from 'http-status';
import moment from 'moment-timezone';
import { DataTypes, Model } from 'sequelize';
import { AppEvent } from 'rabbit-event-source';
import { isEqual, includes, pick, keys } from 'lodash';

import postgres from '../../config/postgres';
import { serviceName } from '../../config/vars';
import APIException from '../utils/APIException';
import messages from '../../config/messages';
import eventBus from '../services/events/event-bus';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class Store extends Model { }

/**
 * User Schema
 * @public
 */
Store.init(
    {
        id: {
            type: DataTypes.STRING(50),
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(155),
            defaultValue: null,
            validate: {
                isEmail: true
            }
        },
        address: {
            type: DataTypes.STRING(255),
            defaultValue: null
        },
        description: {
            type: DataTypes.STRING(255),
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
        modelName: 'store',
        tableName: 'tbl_stores'
    }
);

/**
 * Register event emiter
 */
Store.EVENT_SOURCE = `${serviceName}.store`;
Store.Events = {
    STORE_CREATED: `${serviceName}.store.created`,
    STORE_UPDATED: `${serviceName}.store.updated`,
    STORE_DELETED: `${serviceName}.store.deleted`
};

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
Store.addHook('afterCreate', (model) => {
    const dataValue = model.dataValues;
    eventBus.emit(
        AppEvent.Events.APP_EVENT_CREATED,
        {
            source: 'stores',
            message: `${dataValue.created_by.id} đã tạo mới chi nhánh: ${dataValue.id}`,
            event: AppEvent.Events.APP_EVENT_CREATED,
            created_by: dataValue.created_by,
            data: dataValue
        }
    );
});

Store.addHook('afterUpdate', (model, options) => {
    const { params } = options;
    const newModel = model.dataValues;
    const oldModel = model._previousDataValues;
    const dataChanged = keys(model._changed);

    eventBus.emit(
        AppEvent.Events.APP_EVENT_UPDATED,
        {
            source: 'stores',
            message: `${params.updated_by.id} đã cập nhật thông tin chi nhánh: ${newModel.id}`,
            user: model.updated_by,
            data: {
                id: newModel.id,
                old: pick(oldModel, dataChanged),
                new: pick(newModel, dataChanged)
            }
        }
    );
});

Store.addHook('afterDestroy', (model, options) => {
    const { params } = options;
    const newModel = model.dataValues;

    eventBus.emit(
        AppEvent.Events.APP_EVENT_DELETED,
        {
            source: 'stores',
            message: `${params.updated_by.id} đã xóa cửa hàng: ${newModel.id}`,
            user: params.updated_by,
            data: newModel
        }
    );
});

/**
 * Transform mongoose model to expose object
 */
Store.transform = (model) => {
    const transformed = {};
    const fields = [
        /** attributes */
        'id',
        'name',
        'logo',
        'phone',
        'email',
        'address',
        'description',

        /** management */
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
Store.getChangedProperties = ({ newModel, oldModel }) => {
    const changedProperties = [];
    const allChangableProperties = [
        'name',
        'phone',
        'email',
        'address',
        'description'
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
 * Get Store By Id
 *
 * @public
 * @param {String} storeId
 */
Store.getStoreById = async (storeId) => {
    try {
        const store = await Store.findByPk(storeId);
        if (!store) {
            throw new APIException({
                status: httpStatus.NOT_FOUND,
                message: messages.NOT_FOUND
            });
        }
        return store;
    } catch (ex) {
        throw (ex);
    }
};

/**
 * Check Duplicate Store Id
 *
 * @public
 * @param {String} storeId
 */
Store.checkDuplicateStoreId = async (storeId) => {
    try {
        const store = await Store.findByPk(storeId);
        if (store) {
            throw new APIException({
                status: httpStatus.BAD_REQUEST,
                message: messages.STOREID_EXISTS
            });
        }
        return null;
    } catch (ex) {
        throw (ex);
    }
};

/**
 * Generate Table
 */
Store.sync({});

/**
 * @typedef Store
 */
export default Store;
