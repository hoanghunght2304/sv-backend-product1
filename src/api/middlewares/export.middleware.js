/* eslint-disable indent */
import httpStatus from 'http-status';

import messages from '../../config/messages';
import { handler as ErrorHandel } from './errors';
import APIException from '../../common/utils/APIException';

import Export from '../../common/models/export.model';

/**
 * Load store by id add to req locals.
 */
exports.load = async (req, res, next) => {
    try {
        const data = await Export.get(req.params.id);
        req.locals = req.locals ? req.locals : {};
        req.locals.export = data;
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
        req.totalRecords = await Export.totalRecords(req.query);
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};

exports.filterConditions = async (req, res, next) => {
    try {
        const params = req.query ? req.query : {};
        let queries = 'ex.is_active = true ';
        if (params.keyword) queries += `AND ex.id ILIKE '%${params.keyword}%' `;
        if (params.item_types) queries += 'AND p.type IN (:item_types) ';
        req.queries = queries;
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};

/**
 * Count list filters
 *
 * @public
 * @param {Parameters} params
 */
exports.countQueries = async (req, res, next) => {
    try {
        const {
            keyword,
            item_types
        } = req.query;
        const result = await Export.sequelize.query(`
            SELECT COUNT(*)
            FROM tbl_exports AS ex
                LEFT JOIN tbl_export_details d ON d.export_id = ex.id
                LEFT JOIN tbl_products p ON p.id = d.item_id
            WHERE ${req.queries}
            GROUP BY ex.id`,
            {
                replacements: {
                    keyword: keyword,
                    item_types: item_types
                        ? item_types.split(',')
                        : null
                }
            }
        );
        req.countQueries = result[1].rowCount || 0;
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
        const { export: model } = req.locals;
        switch (status) {
            case Export.Statuses.CANCELLED:
            case Export.Statuses.CONFIRMED:
            case Export.Statuses.RETURNING:
                if (
                    model.status === Export.Statuses.CANCELLED ||
                    model.status === Export.Statuses.CONFIRMED ||
                    model.status === Export.Statuses.RETURNING ||
                    model.status === Export.Statuses.RETURNED
                ) {
                    throw new APIException({
                        status: httpStatus.BAD_REQUEST,
                        message: messages.BAD_REQUEST
                    });
                }
                break;
            case Export.Statuses.RETURNED:
                if (
                    model.status === Export.Statuses.CANCELLED ||
                    model.status === Export.Statuses.CONFIRMED ||
                    model.status === Export.Statuses.RETURNED ||
                    model.status === Export.Statuses.DELIVERY
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
