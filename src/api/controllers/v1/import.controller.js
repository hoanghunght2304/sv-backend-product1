import { pick } from 'lodash';
import { Op } from 'sequelize';

import messages from '../../../config/messages';
import { handler as ErrorHandler } from '../../middlewares/errors';

import Import from '../../../common/models/import.model';

/**
 * Create
 *
 * @public
 * @param body as Import
 * @returns {Promise<Import>, APIException>}
 */
exports.create = async (req, res, next) => {
    req.body.created_by = pick(req.user, ['id', 'name']);
    return Import.create(
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
            data: Import.transform(data)
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
 * @returns {Promise<Import[]>, APIException>}
 */
exports.list = async (req, res, next) => {
    Import.list(
        req.query
    ).then(result => {
        res.json({
            code: 0,
            count: req.totalRecords,
            data: result.map(
                x => Import.transform(x)
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
 * @param {String} id
 * @returns {Promise<Import>, APIException>}
 */
exports.detail = async (req, res, next) => res.json({ code: 0, data: Import.transform(req.locals.import) });

/**
 * Update
 *
 * @public
 * @permission IMPORT_UPDATE
 * @param {String} id
 * @param {Import} body
 * @returns {Promise<>, APIException>}
 */
exports.update = async (req, res, next) => {
    const {
        import: oldModel
    } = req.locals;
    const dataChanged = Import.getChangedProperties({
        oldModel: oldModel,
        newModel: req.body
    });
    const params = pick(req.body, dataChanged);
    params.updated_at = new Date();

    /** replace existing data */
    return Import.update(
        params,
        {
            where: {
                id: oldModel.id,
                status: {
                    [Op.notIn]: [
                        Import.Statuses.CONFIRMED,
                        Import.Statuses.CANCELLED,
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
 * Cancel Import
 *
 * @public
 * @permission IMPORT_UPDATE
 * @param {String} id
 * @param {Import} body
 * @returns {Promise<>, APIException>}
 */
exports.cancel = async (req, res, next) => {
    const { status, reason } = req.body;
    return Import.update(
        {
            status: status,
            reason: reason || null,
            updated_at: new Date()
        },
        {
            where: {
                id: req.params.id
            },
            params: {
                event_source: Import.Events.IMPORT_CANCELLED,
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
 * Confirm Import
 *
 * @public
 * @permission IMPORT_UPDATE
 * @param {String} id
 * @param {Import} body
 * @returns {Promise<>, APIException>}
 */
exports.confirm = async (req, res, next) => {
    const { status, reason } = req.body;
    const { import: goodsRecepit } = req.locals;

    return Import.update(
        {
            reason: reason,
            status: status,
            updated_at: new Date()
        },
        {
            where: {
                id: goodsRecepit.id
            },
            params: {
                event_source: Import.Events.IMPORT_CONFIRMED,
                updated_by: pick(req.user, ['id', 'name']),
                items: goodsRecepit.items
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
