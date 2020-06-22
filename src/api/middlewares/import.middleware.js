import httpStatus from 'http-status';
import { Op } from 'sequelize';

import messages from '../../config/messages';
import { handler as ErrorHandel } from './errors';
import APIException from '../../common/utils/APIException';

import Import from '../../common/models/import.model';


/**
 * Load store by id add to req locals.
 */
exports.load = async (req, res, next) => {
    try {
        const data = await Import.get(req.params.id);
        req.locals = req.locals ? req.locals : {};
        req.locals.import = data;
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

        const conditions = { is_active: true };
        if (start && end) conditions.created_at = { [Op.gte]: start, [Op.lte]: end };
        if (params.stores) conditions['store.id'] = { [Op.in]: params.stores };
        if (params.statuses) conditions.status = { [Op.in]: params.statuses };
        if (params.keyword) conditions.id = { [Op.iLike]: `%${params.keyword}%` };
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
        req.totalRecords = await Import.totalRecords(req.query);
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
        const { import: model } = req.locals;

        switch (status) {
            case Import.Statuses.CANCELLED:
            case Import.Statuses.CONFIRMED:
                if (
                    model.status === Import.Statuses.CANCELLED ||
                    model.status === Import.Statuses.CONFIRMED
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
