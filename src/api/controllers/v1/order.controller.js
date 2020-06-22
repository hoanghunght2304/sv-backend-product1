import { Op } from 'sequelize';
import { pick } from 'lodash';

import { handler as ErrorHandler } from '../../middlewares/errors';
import messages from '../../../config/messages';

import Order from '../../../common/models/order.model';

/**
 * List
 *
 * @public
 * @param {*} queryParams
 * @returns {Promise<Order[], APIException>}
 */
exports.list = async (req, res, next) => {
    Order.list(
        req.query
    ).then(orders => {
        res.json({
            count: req.totalRecords,
            data: orders.map(x => Order.transform(x))
        });
    }).catch(ex => {
        ErrorHandler(ex, req, res, next);
    });
};

/**
 * Create
 *
 * @public
 * @param {*} body
 * @returns {Promise<Order, APIException>}
 */
exports.create = (req, res, next) => {
    const { products } = req.body;
    req.body.created_by = pick(
        req.user,
        ['id', 'name']
    );
    Order.create(
        req.body,
        {
            products
        }
    ).then(data => {
        res.json({
            message: messages.CREATE_SUCCESS,
            data: Order.transform(data)
        });
    }).catch(ex => {
        ErrorHandler(ex, req, res, next);
    });
};


/**
 * Detail
 *
 * @public
 * @param {*} body
 * @returns {Promise<Order, APIException>}
 */
exports.detail = (req, res) => res.json({ code: 0, data: Order.transform(req.locals.order) });

/**
 * Update
 *
 * @public
 * @param {*} body
 * @returns {Promise<Order, APIException>}
 */
exports.update = (req, res, next) => {
    const { order } = req.locals;
    const collumChanged = Order.getChangedProperties({
        oldModel: order,
        newModel: req.body
    });

    //  load data changed
    const dataChanged = pick(req.body, collumChanged);
    dataChanged.updated_at = new Date();
    return Order.update(
        dataChanged,
        {
            where: {
                id: order.id,
                status: { [Op.ne]: Order.Statuses.CANCELLED }
            },
            user: pick(req.user, ['id', 'name']),
            event: Order.Events.ORDER_UPDATED,
            products: req.body.products,
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
 * Confirm
 *
 * @public
 * @param {*} body
 * @returns {Promise<Order, APIException>}
 */
exports.confirm = async (req, res, next) => {
    const { order } = req.locals;
    await Order.update(
        {
            status: Order.Statuses.CONFIRMED,
            updated_at: new Date()
        },
        {
            where: {
                id: order.id,
            },
            individualHooks: true,
            user: pick(req.user, ['id', 'name']),
            event: Order.Events.ORDER_UPDATED
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
 * Cancel
 *
 * @public
 * @param {*} body
 * @returns {Promise<Order, APIException>}
 */
exports.cancel = (req, res, next) => {
    const { order } = req.locals;
    return Order.update(
        {
            status: Order.Statuses.CANCELLED,
            updated_at: new Date()
        },
        {
            where: {
                id: order.id,
            },
            individualHooks: true,
            user: pick(req.user, ['id', 'name']),
            event: Order.Events.ORDER_CANCELLED
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
 * Payment
 *
 * @public
 * @param {*} body
 * @returns {Promise<null, APIException>}
 */
exports.payment = (req, res, next) => {
    const { order } = req.locals;
    const { total_paid, total_unpaid, method } = req.body;
    Order.update(
        {
            total_paid: total_paid,
            total_unpaid: total_unpaid,
            payment_method: method,
            updated_at: new Date(),
        },
        {
            where: {
                id: order.id,
                status: { [Op.ne]: Order.Statuses.CANCELLED }
            },
            params: req.body,
            user: pick(req.user, ['id', 'name']),
            event: Order.Events.ORDER_PAYMENTED,
            individualHooks: true
        }
    ).then(() => {
        res.json({
            code: 0,
            message: 'payment_success'
        });
    }).catch(ex => {
        ErrorHandler(ex, req, res, next);
    });
};
