import { pick } from 'lodash';

import messages from '../../../config/messages';
import { handler as ErrorHandler } from '../../middlewares/errors';
import ProductType from '../../../common/models/product-type.model';

/**
 * List
 *
 * @public
 * @param {Parameters} query
 * @returns {Promise<ProductType[]>, APIException>}
 */
exports.list = async (req, res, next) => {
    try {
        const result = await ProductType.findAndCountAll({
            where: req.conditions,
            order: [
                ['created_at', 'DESC']
            ],
            limit: req.query.limit,
            offset: req.query.skip
        });

        return res.json({
            code: 0,
            count: result.count,
            data: result.rows.map(
                group => ProductType.transform(group)
            )
        });
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};

/**
 * Create
 *
 * @public
 * @param {ProductType} body
 * @returns {Promise<ProductType>, APIException>}
 */
exports.create = async (req, res, next) => {
    const { user } = req;
    req.body.created_by = pick(user, ['id', 'name']);
    req.body.id = req.body.id.toLowerCase();
    return ProductType.create(
        req.body
    ).then((data) => {
        res.json({
            code: 0,
            message: messages.CREATE_SUCCESS,
            data: ProductType.transform(data)
        });
    }).catch(ex => {
        ErrorHandler(ex, req, res, next);
    });
};

/**
 * Detail
 *
 * @public
 * @param {String} id
 * @returns {Promise<ProductType>, APIException>}
 */
exports.detail = async (req, res, next) => res.json({ code: 0, data: ProductType.transform(req.locals.type) });

/**
 * Update
 *
 * @public
 * @param {Type} body
 * @returns {Promise<>, APIException>}
 */
exports.update = async (req, res, next) => {
    const { type: oldModel } = req.locals;
    const dataChanged = ProductType.getChangedProperties({
        oldModel: oldModel,
        newModel: req.body
    });

    /**  update existing item */
    const data = pick(req.body, dataChanged);
    data.updated_at = new Date();
    return ProductType.update(
        data,
        {
            where: {
                id: oldModel.id
            },
            params: {
                user: pick(req.user, ['id', 'name']),
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
 * @param {String} id
 * @returns {Promise<>, APIException>}
 */
exports.delete = async (req, res, next) => {
    try {
        const { type } = req.locals;
        await ProductType.destroy({
            where: {
                id: type.id
            },
            params: {
                updated_by: pick(req.user, ['id', 'name'])
            },
            individualHooks: true
        });
        return res.json({
            code: 0,
            message: messages.REMOVE_SUCCESS
        });
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};
