import Joi from 'joi';
import { values } from 'lodash';
import OrderDetail from '../../../common/models/order-item.model';

module.exports = {

    // GET v1/order-items
    listItemsValidation: {
        query: {
            skip: Joi.number()
                .default(0)
                .min(0),
            limit: Joi.number()
                .default(10)
                .min(10),
            statuses: Joi.array()
                .items(Joi.string().only(
                    values(OrderDetail.ItemStatuses)
                ))
                .required(),
            people_perform: Joi.array()
                .items(Joi.string())
                .allow(null, ''),

            /** product filter */
            order_id: Joi.string()
                .allow(null, '')
                .trim(),
            customer: Joi.string()
                .allow(null, '')
                .trim(),

            /** date filter */
            start_time: Joi.date()
                .allow(null, ''),
            end_time: Joi.date()
                .allow(null, ''),
            by_date: Joi.string()
                .only([
                    'create',
                    'update',
                    'try_one',
                    'try_two'
                ])
                .default('create')
                .allow(null, ''),

            /** sorting */
            sort_by: Joi.string()
                .only([
                    'create',
                    'update',
                    'try_one',
                    'try_two',
                    'deadline'
                ])
                .default('create')
                .allow(null, ''),
            order_by: Joi.string()
                .only(['asc', 'desc'])
                .default('desc')
                .allow(null, '')
        }
    },

    // GET v1/order-items/:orderId
    detailItemValidation: {
        params: {
            orderId: Joi.string()
                .required()
        },
        query: {
            product_id: Joi.string()
                .required()
        }
    },

    // POST v1/order-items
    assignValidation: {
        query: {
            product_id: Joi.string()
                .required()
        },
        body: {
            // order-item process
            cut_process: Joi.object({
                complete_by: Joi.string().default(null),
                complete_at: Joi.date().default(null),
                point: Joi.number().default(0)
            }).allow(null, ''),

            prepare_process: Joi.object({
                complete_by: Joi.string().default(null),
                complete_at: Joi.date().default(null),
                point: Joi.number().default(0)
            }).allow(null, ''),

            sew_process: Joi.object({
                complete_by: Joi.string().default(null),
                complete_at: Joi.date().default(null),
                point: Joi.number().default(0)
            }).allow(null, ''),

            kcs_one_process: Joi.object({
                complete_by: Joi.string().default(null),
                complete_at: Joi.date().default(null),
                point: Joi.number().default(0)
            }).allow(null, ''),

            complete_process: Joi.object({
                complete_by: Joi.string().default(null),
                complete_at: Joi.date().default(null),
                point: Joi.number().default(0)
            }).allow(null, ''),

            kcs_two_process: Joi.object({
                complete_by: Joi.string().default(null),
                complete_at: Joi.date().default(null),
                point: Joi.number().default(0)
            }).allow(null, ''),

            storage_process: Joi.object({
                complete_by: Joi.string().default(null),
                complete_at: Joi.date().default(null),
                location: Joi.string().default(null)
            }).allow(null, '')
        }
    },

    // POST v1/order-items
    processValidation: {
        body: {
            status: Joi.string()
                .only(values(OrderDetail.ItemStatuses))
                .required(),
            products: Joi.array()
                .items(
                    Joi.object({
                        order_id: Joi.string()
                            .required(),
                        product_id: Joi.string()
                            .required()
                    })
                )
                .min(1)
                .required()
        }
    }
};
