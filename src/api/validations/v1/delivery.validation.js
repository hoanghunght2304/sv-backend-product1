import Joi from 'joi';
import { values } from 'lodash';
import Delivery from '../../../common/models/delivery.model';

module.exports = {
    // POST: /v1/deliveries
    createValidation: {
        body: {
            note: Joi.string()
                .max(255)
                .allow(null, ''),
            order_id: Joi.string()
                .max(24)
                .required(),
            products: Joi.array()
                .items(Joi.string())
                .min(1)
                .required(),

            // delivery management
            method: Joi.string()
                .only(values(Delivery.Methods))
                .allow(null, ''),
            status: Joi.string()
                .only(Delivery.Statuses.DELIVERED)
                .allow(null, ''),

            // 3RD API
            service: Joi.object({})
                .allow(null, ''),

            // payment management
            total_price: Joi.number()
                .min(0)
                .required(),
            total_quantity: Joi.number()
                .min(0)
                .required()
        }
    }
};
