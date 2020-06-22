import { pick } from 'lodash';
import { Op } from 'sequelize';

import { handler as ErrorHandler } from '../../middlewares/errors';
import messages from '../../../config/messages';

import StockTake from '../../../common/models/stock-take.model';

/**
 * Create
 *
 * @public
 * @permision STOCK_CREATE
 * @param body as StockTake
 * @returns {Promise<StockTake>, APIException>}
 */
exports.create = async (req, res, next) => {
    req.body.created_by = pick(req.user, ['id', 'name']);
    return StockTake.create(
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
            data: StockTake.transform(data)
        });
    }).catch(ex => {
        ErrorHandler(ex, req, res, next);
    });
};

/**
 * List
 *
 * @public
 * @permision STOCK_LIST
 * @param {Parametters} params
 * @returns {Promise<StockTake[]>, APIException>}
 */
exports.list = async (req, res, next) => {
    StockTake.list(req.query).then(results => {
        res.json({
            code: 0,
            count: req.totalRecords,
            data: results.map(x => StockTake.transform(x))
        });
    }).catch(ex => {
        ErrorHandler(ex, req, res, next);
    });
};

/**
 * Detail
 *
 * @public
 * @permision STOCK_CREATE
 * @returns {Promise<StockTake>, APIException>}
 */
exports.detail = async (req, res) => res.json({ code: 0, data: StockTake.transform(req.locals.stockTake) });

/**
 * Update
 *
 * @public
 * @permission STOCK_UPDATE
 * @param {String} id
 * @param {StockTake} body
 * @returns {Promise<>, APIException>}
 */
exports.update = async (req, res, next) => {
    const {
        stockTake: oldModel
    } = req.locals;
    const dataChanged = StockTake.getChangedProperties({
        oldModel: oldModel,
        newModel: req.body
    });
    const params = pick(req.body, dataChanged);
    params.updated_at = new Date();

    /** replace existing data */
    return StockTake.update(
        params,
        {
            where: {
                id: oldModel.id,
                status: {
                    [Op.notIn]: [
                        StockTake.Statuses.CONFIRMED,
                        StockTake.Statuses.CANCELLED,
                    ]
                }
            },
            params: {
                updated_by: req.user
            },
            individualHooks: true
        }
    ).then(value => {
        res.json({
            code: 0,
            message: messages.UPDATE_SUCCESS,
            export: value.transform()
        });
    }).catch(ex => {
        ErrorHandler(ex, req, res, next);
    });
};

/**
 * Cancel Stock Take
 *
 * @public
 * @permission STOCK_UPDATE
 * @param {String} id
 * @param {StockTake} body
 * @returns {Promise<>, APIException>}
 */
exports.cancel = async (req, res, next) => {
    const { status, reason } = req.body;
    return StockTake.update(
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
                event_source: StockTake.Events.STOCK_CANCELLED,
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
 * Confirm Stock Take
 *
 * @public
 * @permission STOCK_UPDATE
 * @param {String} id
 * @param {StockTake} body
 * @returns {Promise<>, APIException>}
 */
exports.confirm = async (req, res, next) => {
    const { status, reason } = req.body;
    const { stockTake } = req.locals;

    return StockTake.update(
        {
            reason: reason,
            status: status,
            confirmed_at: new Date(),
            updated_at: new Date()
        },
        {
            where: {
                id: stockTake.id
            },
            params: {
                event_source: StockTake.Events.STOCK_CONFIRMED,
                items: stockTake.items,
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
