import httpStatus from 'http-status';
import messages from '../../../config/messages';
import APIException from '../../../common/utils/APIException';
import OrderItem from '../../models/order-item.model';

async function getItem({ orderId, productId }) {
    const orderItem = await OrderItem.get({
        orderId,
        productId
    });
    if (!orderItem) {
        throw new APIException({
            status: httpStatus.NOT_FOUND,
            message: `không tìm thấy sản phẩm: ${productId}`
        });
    }
    if (
        orderItem.status === OrderItem.ItemStatuses.CANCELLED ||
        orderItem.status === OrderItem.ItemStatuses.DELIVERED
    ) {
        throw new APIException({
            status: httpStatus.BAD_REQUEST,
            message: messages.BAD_REQUEST
        });
    }

    return {
        id: productId,
        name: orderItem.name,
        total_price: parseInt(orderItem.total_price, 10),
        total_quantity: orderItem.total_quantity
    };
}

/**
 * Parse item to order item
 * @param {*} items
 */
async function parseItems({ items, orderId }) {
    const promises = items.map(
        itemId => getItem({
            productId: itemId,
            orderId: orderId
        })
    );
    return Promise.all(promises);
}

/**
 * Calculate price
 * @param {*} order
 */
async function parsePrices(model) {
    const { products } = model;
    let price_before_discount = 0;
    let total_quantity = 0;

    // calculate price
    products.forEach(item => {
        price_before_discount += item.total_price;
        total_quantity += item.total_quantity;
    });

    return {
        total_price: price_before_discount,
        total_quantity: total_quantity
    };
}

export default {
    parseItems,
    parsePrices
};
