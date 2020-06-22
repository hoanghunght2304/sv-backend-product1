import { handler as ErrorHandel } from './errors';
import Product from '../../common/models/product.model';

/**
 * Check duplicate data.
 */
exports.verify = async (req, res, next) => {
    try {
        await Product.checkDuplicateId(req.body.id);
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};

/**
 * Load item by id add to req locals.
 */
exports.load = async (req, res, next) => {
    try {
        const product = await Product.getProductById(req.params.id);
        req.locals = req.locals ? req.locals : {};
        req.locals.product = product;
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};

/**
 * Load count for filter.
 */
exports.count = async (req, res, next) => {
    try {
        req.totalRecords = await Product.countQueries(req.query);
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};
