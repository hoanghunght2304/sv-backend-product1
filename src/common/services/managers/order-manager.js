import httpStatus from 'http-status';
import APIException from '../../../common/utils/APIException';
import Product from '../../models/product.model';

async function getItem(item) {
    const itemInStock = await Product.findByPk(
        item.id
    );
    if (!itemInStock) {
        throw new APIException({
            status: httpStatus.NOT_FOUND,
            message: `không tìm thấy sản phẩm: ${item.id}`
        });
    }

    // transform data
    const returnItem = item;
    returnItem.currency = itemInStock.currency;
    returnItem.price = itemInStock.price;
    returnItem.product_id = item.id;
    delete returnItem.id;

    // TODO:: Load promotions

    // transform price
    returnItem.price_before_discount = Math.ceil(itemInStock.price * returnItem.total_quantity);
    returnItem.total_price = Math.ceil(returnItem.price_before_discount + returnItem.total_service_price);
    returnItem.total_discount = Math.ceil(returnItem.total_price - returnItem.price_before_discount);

    return returnItem;
}

/**
 * Parse item to order item
 * @param {*} items
 */
async function parseItems(items) {
    const promises = items.map(getItem);
    return Promise.all(promises);
}

/**
 * Parse vouchers
 * @param {*} vouchers
 */
async function parseVouchers(vouchers) {
    // TODO: Check condition
    return vouchers;
}

/**
 * Calculate price
 * @param {*} order
 */
async function parsePrices(order) {
    const { products, vouchers } = order;
    let price_before_discount = 0;
    let price_after_discount = 0;

    // calculate price
    products.forEach(item => { price_before_discount += item.total_price; });
    price_after_discount = price_before_discount;

    // calculate discount
    if (vouchers) {
        vouchers.forEach(voucher => {
            switch (voucher.type) {
                case 1:
                    price_after_discount = price_before_discount * [(100 - voucher.value) / 100];
                    break;
                case 2:
                    price_after_discount = price_before_discount - voucher.value;
                    break;
                default: break;
            }
        });
    }


    // transform price to return
    const total_coin_pasre = (order.total_coin || 0) * 10;
    const total_price = Math.ceil(price_after_discount - total_coin_pasre);
    const total_discount = Math.ceil(price_before_discount - price_after_discount);
    const total_unpaid = Math.ceil(total_price - (order.total_paid || 0));
    const total_paid = Math.ceil(total_price - total_unpaid);

    // calculate loay = 0.15%
    const total_point = Math.ceil(
        (price_after_discount - (price_after_discount * [(100 - 0.15) / 100])) / 10
    );

    return {
        total_point,
        total_price,
        price_before_discount,
        total_discount,
        total_paid,
        total_unpaid
    };
}

export default {
    parseItems,
    parseVouchers,
    parsePrices
};
