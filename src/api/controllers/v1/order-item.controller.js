import { Op } from 'sequelize';
import { pick } from 'lodash';

import messages from '../../../config/messages';
import { handler as ErrorHandler } from '../../middlewares/errors';
import OrderDetail from '../../../common/models/order-item.model';

/**
 * List
 *
 * @public
 * @returns {Promise<OrderDetail, APIException>}
 */
exports.list = async (req, res, next) => {
    try {
        const products = await OrderDetail.list(req.query);
        return res.json({
            code: 0,
            count: req.totalRecords,
            data: products.map(
                x => OrderDetail.transform(x)
            )
        });
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};

/**
 * Detail item of order
 *
 * @public
 * @returns {Promise<OrderDetail, APIException>}
 */
exports.detail = async (req, res, next) => res.json({ code: 0, data: OrderDetail.transform(req.locals.product) });

/**
 * Assign
 *
 * @public
 * @permision PRODUCTION_ASSIGN
 * @returns {Promise<null, APIException>}
 */
exports.assign = (req, res, next) => {
    const { product, user } = req.locals;
    const dataChanged = OrderDetail.getChangedProperties({
        oldModel: product,
        newModel: req.body
    });

    /** load param changed */
    const params = pick(req.body, dataChanged);
    params.updated_at = new Date();
    params.status = product.status === OrderDetail.ItemStatuses.PENDING
        ? OrderDetail.ItemStatuses.CUTTING
        : product.status;
    /**  replace existing order */
    return OrderDetail.update(
        params,
        {
            where: {
                product_id: req.query.product_id,
                order_id: req.params.orderId
            },
            event_source: OrderDetail.Events.PRODUCT_ASSIGNMENT,
            updated_by: user,
            individualHooks: true
        }
    ).then(() => {
        res.json({
            code: 0,
            message: messages.UPDATE_SUCCESS
        });
    }).catch(ex => {
        console.log(ex);
        ErrorHandler(ex, req, res, next);
    });
};

/**
 * Process
 *
 * @public
 * @returns {Promise<null, APIException>}
 */
exports.changeProcess = (req, res, next) => {
    const operations = [];
    req.body.products.map(x =>
        operations.push({
            order_id: x.order_id,
            product_id: x.product_id
        })
    );

    return OrderDetail.update(
        {
            status: req.body.status,
            updated_at: new Date()
        },
        {
            where: {
                status: {
                    [Op.notIn]: [
                        OrderDetail.ItemStatuses.CANCELLED,
                        OrderDetail.ItemStatuses.DELIVERED
                    ]
                },
                [Op.or]: operations
            },
            params: {
                event_source: OrderDetail.Events.PRODUCT_CHANGE_PROCESS,
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
