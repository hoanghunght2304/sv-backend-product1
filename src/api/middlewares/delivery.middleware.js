import { handler as ErrorHandler } from './errors';
import deliveryMangager from '../../common/services/managers/delivery-manager';

/**
 * Perpare order params
 */
exports.prepareOrder = async (req, res, next) => {
    try {
        const params = req.body;
        if (params.products && params.products.length) {
            params.products = await deliveryMangager.parseItems({
                items: params.products,
                orderId: params.order_id
            });
        }

        // Calculate price
        const priceCalculate = await deliveryMangager.parsePrices(
            params
        );
        params.total_price = priceCalculate.total_price;
        params.total_quantity = priceCalculate.total_quantity;
        req.body = params;

        return next();
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};
