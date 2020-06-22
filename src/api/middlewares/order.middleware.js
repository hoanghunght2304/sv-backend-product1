
import httpStatus from 'http-status';

import messages from '../../config/messages';
import APIException from '../../common/utils/APIException';
import { handler as ErrorHandler } from './errors';

import Order from '../../common/models/order.model';
import orderMangager from '../../common/services/managers/order-manager';

/**
 * Load order by id appendd to locals.
 */
exports.load = async (req, res, next) => {
    try {
        const order = await Order.get(req.params.id || req.body.id);
        req.locals = req.locals ? req.locals : {};
        req.locals.order = Order.transform(order);
        return next();
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};

/**
 * Load total order appendd to locals.
 */
exports.count = async (req, res, next) => {
    try {
        const totalRecords = await Order.totalRecords(req.query);
        req.totalRecords = totalRecords;
        return next();
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};

/**
 * Validate confirm order
 */
exports.checkConfirm = async (req, res, next) => {
    try {
        const { order } = req.locals;
        if (
            order.status === Order.Statuses.CONFIRMED ||
            order.status === Order.Statuses.CANCELLED ||
            order.status === Order.Statuses.COMPLETED
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

/**
 * Validate cancel order
 */
exports.checkCancel = async (req, res, next) => {
    try {
        const { order } = req.locals;
        if (
            order.status === Order.Statuses.CANCELLED ||
            order.status === Order.Statuses.COMPLETED
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

/**
 * Validate payment
 */
exports.checkPayment = async (req, res, next) => {
    try {
        const { order } = req.locals;
        if (req.body.paid > order.total_unpaid) {
            throw new APIException({
                status: httpStatus.BAD_REQUEST,
                message: messages.BAD_REQUEST
            });
        }

        // calculate price
        const params = req.body;
        params.total_paid = order.total_paid + params.paid;
        params.total_unpaid = order.total_price - params.total_paid;
        req.body = params;

        return next();
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};

/**
 * Perpare order params
 */
exports.prepareOrder = async (req, res, next) => {
    try {
        const params = req.body;
        if (params.products && params.products.length) {
            params.products = await orderMangager.parseItems(params.products);
        }
        if (params.vouchers && params.vouchers.length) {
            params.vouchers = await orderMangager.parseVouchers(params.vouchers);
        }

        // Calculate price
        const priceCalculate = await orderMangager.parsePrices(
            params
        );
        params.total_point = priceCalculate.total_point;
        params.total_price = priceCalculate.total_price;
        params.total_discount = priceCalculate.total_discount;
        params.price_before_discount = priceCalculate.price_before_discount;
        params.total_paid = priceCalculate.total_paid;
        params.total_unpaid = priceCalculate.total_unpaid;

        // transform body
        req.body = params;
        return next();
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};
