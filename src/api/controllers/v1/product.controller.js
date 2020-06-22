import { pick } from 'lodash';
import messages from '../../../config/messages';
import { handler as ErrorHandler } from '../../middlewares/errors';
import Product from '../../../common/models/product.model';

/**
 * Create
 *
 * @public
 * @param body as Product
 * @returns {Promise<Product, APIError>}
 */
exports.create = (req, res, next) => {
    req.body.created_by = pick(
        req.user,
        ['id', 'name']
    );
    Product.create(
        req.body,
        {
            operations: {
                parts: req.body.parts,
                prices: req.body.prices
            }
        }
    ).then((data) => {
        res.json({
            code: 0,
            message: messages.CREATE_SUCCESS,
            data: Product.transform(data)
        });
    }).catch(ex => {
        ErrorHandler(ex, req, res, next);
    });
};

/**
 * List
 *
 * @public
 * @param id
 * @returns {Promise<Product[], APIError>}
 */
exports.list = async (req, res, next) => {
    Product.list(
        req.query
    ).then(result => {
        res.json({
            code: 0,
            count: req.totalRecords,
            data: result.map(
                x => Product.transform(x)
            )
        });
    }).catch(ex => {
        ErrorHandler(ex, req, res, next);
    });
};

/**
 * Detail
 *
 * @public
 * @param id
 * @returns {Promise<Product, APIError>}
 */
exports.detail = (req, res) => res.json({ code: 0, data: Product.transform(req.locals.product) });

/**
 * Update
 *
 * @public
 * @param body
 * @returns {Promise<Product, APIError>}
 */
exports.update = async (req, res, next) => {
    const { product: oldModel } = req.locals;

    // parse data
    const dataChanged = Product.getChangedProperties({
        oldModel: oldModel,
        newModel: req.body
    });

    // replace existing product
    const paramChanged = pick(req.body, dataChanged);
    paramChanged.updated_at = new Date();
    return Product.update(
        paramChanged,
        {
            where: {
                id: oldModel.id
            },
            operations: {
                parts: req.body.parts,
                prices: req.body.prices,
                updated_by: pick(req.user, ['id', 'name']),
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
 * Delete product
 * @public
 * @param id
 * @returns {Promise<, APIError}
 */
exports.delete = async (req, res, next) => {
    try {
        const { product } = req.locals;
        await Product.destroy({
            where: {
                id: product.id
            },
            updated_by: pick(req.user, ['id', 'name']),
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

