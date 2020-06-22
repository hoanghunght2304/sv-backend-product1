import { pick } from 'lodash';
import { handler as ErrorHandler } from '../../middlewares/errors';
import messages from '../../../config/messages';

import Store from '../../../common/models/store.model';

/**
 * Create
 *
 * @public
 * @permision STORE_CREATE
 * @param body as StoreSchema
 * @returns {Promise<StoreSchema>, APIException>}
 */
exports.create = async (req, res, next) => {
    try {
        req.body.created_by = pick(req.user, ['id', 'name']);
        const store = new Store(req.body);
        await store.save();

        return res.json({
            code: 0,
            message: messages.CREATE_SUCCESS,
            data: Store.transform(store)
        });
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};

/**
 * List
 *
 * @public
 * @permision STORE_LIST
 * @param query
 * @returns {Promise<StoreSchema[]>, APIException>}
 */
exports.list = async (req, res, next) => {
    try {
        const result = await Store.findAndCountAll({
            where: req.conditions,
            order: [
                ['updated_at', 'desc']
            ],
            offset: req.query.skip,
            limit: req.query.limit
        });

        return res.json({
            code: 0,
            count: result.count,
            data: result.rows.map(
                value => Store.transform(value)
            )
        });
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};

/**
 * Detail
 *
 * @public
 * @permision STORE_DETAIL
 * @param {String} id
 * @returns {Promise<StoreSchema>, APIException>}
 */
exports.detail = async (req, res, next) => res.json({ code: 0, data: Store.transform(req.locals.store) });

/**
 * Update
 *
 * @public
 * @permission STORE_UPDATE
 * @param {String} id
 * @param {StoreSchema} body
 * @returns {Promise<>, APIException>}
 */
exports.update = async (req, res, next) => {
    const {
        user,
        store: oldModel
    } = req.locals;
    const dataChanged = Store.getChangedProperties({
        oldModel: oldModel,
        newModel: req.body
    });
    const params = pick(req.body, dataChanged);
    params.updated_at = new Date();

    /** replace existing data */
    return Store.update(
        params,
        {
            where: {
                id: oldModel.id
            },
            params: {
                updated_by: user
            },
            individualHooks: true
        }
    ).then(() => {
        res.json({
            code: 0,
            message: messages.UPDATE_SUCCESS
        });
    }).catch(ex => {
        ErrorHandler(ex, req, res, next);
    });
};

/**
 * Remove
 *
 * @public
 * @permission STORE_DELETE
 * @param {String} id
 * @returns {Promise<>, APIException>}
 */
exports.delete = (req, res, next) => {
    const { store } = req.locals;
    return Store.destroy({
        where: {
            id: store.id
        },
        params: {
            updated_by: req.user
        },
        individualHooks: true
    }).then(() => {
        res.json({
            code: 0,
            message: messages.REMOVE_SUCCESS
        });
    }).catch(ex => {
        ErrorHandler(ex, req, res, next);
    });
};
