/* eslint-disable indent */
import { pick } from 'lodash';
import { Op } from 'sequelize';

import messages from '../../../config/messages';
import { handler as ErrorHandler } from '../../middlewares/errors';

import Export from '../../../common/models/export.model';

/**
 * Create
 *
 * @public
 * @param body as Export
 * @returns {Promise<Export>, APIException>}
 */
exports.create = async (req, res, next) => {
    req.body.created_by = pick(
        req.user,
        ['id', 'name', 'roles']
    );
    return Export.create(
        req.body,
        {
            params: {
                items: req.body.items
            }
        }
    ).then(data => {
        res.json({
            code: 0,
            message: messages.CREATE_SUCCESS,
            data: Export.transform(data)
        });
    }).catch(ex => {
        ErrorHandler(ex, req, res, next);
    });
};

/**
 * List
 *
 * @public
 * @param query
 * @returns {Promise<Export[]>, APIException>}
 */
exports.list = async (req, res, next) => {
    Export.list(req.query).then(results => {
        res.json({
            code: 0,
            count: req.totalRecords,
            data: results.map(x => Export.transform(x))
        });
    }).catch(ex => {
        ErrorHandler(ex, req, res, next);
    });
};

/**
 * List By Process
 *
 * @public
 * @param query
 * @returns {Promise<Export[]>, APIException>}
 */
exports.listProcess = async (req, res, next) => {
    const {
        skip,
        limit,
        keyword,
        item_types
    } = req.query;
    Export.sequelize.query(`
            SELECT
                ex.*
            FROM tbl_exports ex
                LEFT JOIN tbl_export_details d ON d.export_id = ex.id
                LEFT JOIN tbl_products p ON p.id = d.item_id
            WHERE ${req.queries}
            GROUP BY ex.id
            ORDER BY ex.updated_at DESC
            OFFSET ${skip}
            LIMIT ${limit}`,
        {
            replacements: {
                keyword: keyword,
                item_types: item_types
                    ? item_types.split(',')
                    : null
            }
        }
    ).then(results => {
        res.json({
            code: 0,
            count: req.countQueries,
            data: results[0].map(x => Export.transform(x))
        });
    }).catch(ex => {
        throw ex;
    });
};

/**
 * Detail
 *
 * @public
 * @param {String} id
 * @returns {Promise<Export>, APIException>}
 */
exports.detail = async (req, res) => res.json({ code: 0, data: Export.transform(req.locals.export) });

/**
 * Update
 *
 * @public
 * @permission EXPORT_UPDATE
 * @param {String} id
 * @param {Export} body
 * @returns {Promise<>, APIException>}
 */
exports.update = async (req, res, next) => {
    const {
        export: oldModel
    } = req.locals;
    const dataChanged = Export.getChangedProperties({
        oldModel: oldModel,
        newModel: req.body
    });
    const params = pick(req.body, dataChanged);
    params.updated_at = new Date();

    /** replace existing data */
    return Export.update(
        params,
        {
            where: {
                id: oldModel.id,
                status: {
                    [Op.notIn]: [
                        Export.Statuses.CONFIRMED,
                        Export.Statuses.CANCELLED,
                        Export.Statuses.RETURNED
                    ]
                }
            },
            params: {
                updated_by: req.user
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
 * Cancel Export
 *
 * @public
 * @permission EXPORT_UPDATE
 * @param {String} id
 * @param {Export} body
 * @returns {Promise<>, APIException>}
 */
exports.cancel = async (req, res, next) => {
    const { status, reason } = req.body;
    const { export: goodIssue } = req.locals;

    return Export.update(
        {
            status: status,
            reason: reason || null,
            updated_at: new Date()
        },
        {
            where: {
                id: goodIssue.id
            },
            params: {
                event_source: Export.Events.EXPORT_CANCELLED,
                updated_by: req.user,
                items: goodIssue.items
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
 * Confirm Export
 *
 * @public
 * @permission EXPORT_UPDATE
 * @param {String} id
 * @param {Export} body
 * @returns {Promise<>, APIException>}
 */
exports.confirm = async (req, res, next) => {
    const { status, reason } = req.body;
    const { export: goodIssue } = req.locals;

    return Export.update(
        {
            reason: reason,
            status: status,
            received_at: new Date(),
            updated_at: new Date()
        },
        {
            where: {
                id: goodIssue.id
            },
            params: {
                event_source: status === Export.Statuses.CONFIRMED
                    ? Export.Events.EXPORT_CONFIRMED
                    : Export.Events.EXPORT_RETURNED,
                updated_by: req.user,
                items: goodIssue.items

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
 * Return Export
 *
 * @public
 * @permission EXPORT_UPDATE
 * @param {String} id
 * @param {Export} body
 * @returns {Promise<>, APIException>}
 */
exports.return = async (req, res, next) => {
    const { status, reason } = req.body;
    const { export: goodIssue } = req.locals;

    return Export.update(
        {
            status: status,
            reason: reason || null,
            updated_at: new Date()
        },
        {
            where: {
                id: goodIssue.id
            },
            params: {
                updated_by: req.user
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
