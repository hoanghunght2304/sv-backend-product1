import httpStatus from 'http-status';

import { handler as ErrorHandler } from './errors';
import APIException from '../../common/utils/APIException';
import messages from '../../config/messages';
import OrderDetail from '../../common/models/order-item.model';

/**
 * Load count items for filter.
 */
exports.count = async (req, res, next) => {
    try {
        req.totalRecords = await OrderDetail.totalRecords(req.query);
        return next();
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};

/**
 * Load order by id appendd to locals.
 */
exports.load = async (req, res, next) => {
    try {
        const product = await OrderDetail.get({
            orderId: req.params.orderId,
            productId: req.query.product_id
        });
        req.locals = req.locals ? req.locals : {};
        req.locals.product = product;
        return next();
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};

/**
 * Validate status before update
 */
exports.validateStatus = async (req, res, next) => {
    try {
        const product = req.locals.product;
        if (
            product.status === OrderDetail.ItemStatuses.CANCELLED ||
            product.status === OrderDetail.ItemStatuses.DELIVERED
        ) {
            throw new APIException({
                status: httpStatus.BAD_REQUEST,
                message: messages.BAD_REQUEST
            });
        }
        return next();
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};
