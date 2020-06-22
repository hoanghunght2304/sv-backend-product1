import { handler as ErrorHandel } from './errors';
import PriceBook from '../../common/models/price-book.model';

/**
 * Check duplicate AtttributeId.
 */
exports.checkDuplicate = async (req, res, next) => {
    try {
        await PriceBook.checkDuplicate(req.params.id);
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};

/**
 * Load attribute by id add to req locals.
 */
exports.load = async (req, res, next) => {
    try {
        const model = await PriceBook.get(
            req.params.id
        );
        req.locals = req.locals || {};
        req.locals.model = model;
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
        req.totalRecords = await PriceBook.countQueries(req.query);
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};
