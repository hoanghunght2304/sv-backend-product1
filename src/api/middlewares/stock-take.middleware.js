import httpStatus from 'http-status';
import { Op } from 'sequelize';

import messages from '../../config/messages';
import { handler as ErrorHandel } from './errors';
import APIException from '../../common/utils/APIException';

import StockTake from '../../common/models/stock-take.model';

/**
 * Load stock-take by id add to req locals.
 */
exports.load = async (req, res, next) => {
    try {
        const stockTake = await StockTake.get(req.params.id);
        req.locals = req.locals ? req.locals : {};
        req.locals.stockTake = stockTake;
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

        /** begin: setup condition */
        const conditions = { is_active: true };
        if (params.statuses) conditions.status = { [Op.in]: params.statuses };
        if (params.stores) conditions['store.id'] = { [Op.in]: params.stores };
        if (params.keyword) conditions.id = { [Op.iLike]: `%${params.keyword}%` };
        if (start && end && params.by_date === 'create') conditions.created_at = { [Op.gte]: start, [Op.lte]: end };
        if (start && end && params.by_date === 'update') conditions.updated_at = { [Op.gte]: start, [Op.lte]: end };

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
        req.totalRecords = await StockTake.totalRecords(req.query);
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};

/**
 * Validate status before update
 */
exports.validateStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const { stockTake: model } = req.locals;

        switch (status) {
            case StockTake.Statuses.CANCELLED:
            case StockTake.Statuses.CONFIRMED:
                if (
                    model.status === StockTake.Statuses.CANCELLED ||
                    model.status === StockTake.Statuses.CONFIRMED
                ) {
                    throw new APIException({
                        status: httpStatus.BAD_REQUEST,
                        message: messages.BAD_REQUEST
                    });
                }
                break;
            default:
                throw new APIException({
                    status: httpStatus.BAD_REQUEST,
                    message: messages.BAD_REQUEST
                });
        }

        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};
