import { Op } from 'sequelize';

import { handler as ErrorHandel } from './errors';
import Type from '../../common/models/product-type.model';

/**
 * Check duplicate TypeId.
 */
exports.checkDuplicate = async (req, res, next) => {
    try {
        await Type.checkDuplicate(req.params.id);
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

        /** setup conditions */
        let start; let end;
        if (params.start_time && params.end_time) {
            start = new Date(params.start_time); end = new Date(params.end_time);
            start.setHours(0, 0, 0, 0); end.setHours(23, 59, 59, 999);
        }

        /** setup conditions */
        const conditions = {
            is_active: true
        };
        if (params.by_date === 'create' && start && end) {
            conditions.created_at = {
                [Op.between]: [start, end]
            };
        }
        if (params.by_date === 'update' && start && end) {
            conditions.updated_at = {
                [Op.between]: [start, end]
            };
        }
        if (params.keyword) {
            conditions.name = {
                [Op.iLike]: `%${params.keyword}%`
            };
        }

        req.conditions = conditions;
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};

/**
 * Load type by id add to req locals.
 */
exports.load = async (req, res, next) => {
    try {
        const type = await Type.get(
            req.params.id
        );
        req.locals = req.locals || {};
        req.locals.type = type;
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};
