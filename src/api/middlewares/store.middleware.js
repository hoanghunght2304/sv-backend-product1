import { Op } from 'sequelize';
import { handler as ErrorHandel } from './errors';
import Store from '../../common/models/store.model';

/**
 * Load store by id add to req locals.
 */
exports.load = async (req, res, next) => {
    try {
        const store = await Store.getStoreById(req.params.id);
        req.locals = req.locals ? req.locals : {};
        req.locals.store = store;
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};

/**
 * Check duplicate store id.
 */
exports.checkDuplicate = async (req, res, next) => {
    try {
        await Store.checkDuplicateStoreId(req.body.id);
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};

/**
 * Load filter conditions append to req.
 */
exports.condition = (req, res, next) => {
    try {
        const params = !req.query ? {} : req.query;
        let start; let end;
        if (params.start_time && params.end_time) {
            start = new Date(params.start_time); end = new Date(params.end_time);
            start.setHours(0, 0, 0, 0); end.setHours(23, 59, 59, 999);
        }

        /** setup conditions */
        const conditions = {
            created_at: start && end
                ? { [Op.gte]: start, [Op.lte]: end }
                : { [Op.ne]: null },
            [Op.or]: {
                id: params.keyword
                    ? { [Op.iLike]: `%${params.keyword}%` }
                    : { [Op.ne]: null },
                name: params.keyword
                    ? { [Op.iLike]: `%${params.keyword}%` }
                    : { [Op.ne]: null },
                phone: params.keyword
                    ? { [Op.iLike]: `%${params.keyword}%` }
                    : { [Op.ne]: null }
            }
        };
        req.conditions = conditions;
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
        req.totalRecords = await Store.count({ where: req.conditions });
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};
