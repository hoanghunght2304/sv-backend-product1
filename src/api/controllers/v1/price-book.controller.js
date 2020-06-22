import { pick } from 'lodash';

import messages from '../../../config/messages';
import { handler as ErrorHandler } from '../../middlewares/errors';
import PriceBook from '../../../common/models/price-book.model';

/**
 * List
 *
 * @public
 * @param {Parameters} query
 * @returns {Promise<PriceBook[]>, APIException>}
 */
exports.list = async (req, res, next) => {
    PriceBook.list(
        req.query
    ).then(data => {
        res.json({
            code: 0,
            count: req.totalRecords,
            data: data.map(x => PriceBook.transform(x))
        });
    }).catch(ex => {
        ErrorHandler(ex, req, res, next);
    });
};

/**
 * Create
 *
 * @public
 * @param {PriceBook} body
 * @returns {Promise<PriceBook>, APIException>}
 */
exports.create = async (req, res, next) => {
    const { user } = req;
    req.body.created_by = pick(user, ['id', 'name']);
    return PriceBook.create(
        req.body
    ).then((data) => {
        res.json({
            code: 0,
            message: messages.CREATE_SUCCESS,
            data: PriceBook.transform(data)
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
 * @returns {Promise<PriceBook>, APIException>}
 */
exports.detail = async (req, res) => res.json({ code: 0, data: PriceBook.transform(req.locals.model) });

/**
 * Update
 *
 * @public
 * @param {PriceBook} body
 * @returns {Promise<null>, APIException>}
 */
exports.update = async (req, res, next) => {
    const { model: oldModel } = req.locals;
    const dataChanged = PriceBook.getChangedProperties({
        oldModel: oldModel,
        newModel: req.body
    });

    /**  update existing item */
    const paramChanged = pick(req.body, dataChanged);
    paramChanged.updated_at = new Date();
    return PriceBook.update(
        paramChanged,
        {
            where: { id: oldModel.id }
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
 * Remove
 *
 * @public
 * @param {String} id
 * @returns {Promise<>, APIException>}
 */
exports.delete = async (req, res, next) => {
    try {
        const { model } = req.locals;
        await PriceBook.destroy({
            where: {
                id: model.id
            }
        });
        return res.json({
            code: 0,
            message: messages.REMOVE_SUCCESS
        });
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};
