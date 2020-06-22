import Joi from 'joi';
import { values } from 'lodash';
import Order from '../../../common/models/order.model';

module.exports = {
    listValidation: {
        query: {
            // sort
            sort_by: Joi.string()
                .only([
                    'created_at',
                    'updated_at'
                ])
                .allow(null, ''),
            order_by: Joi.string()
                .only([
                    'desc',
                    'asc'
                ])
                .allow(null, ''),
            skip: Joi.number()
                .min(0)
                .allow(null, ''),
            limit: Joi.number()
                .min(0)
                .allow(null, ''),

            types: Joi.string()
                .trim()
                .allow(null, ''),
            stores: Joi.string()
                .trim()
                .allow(null, ''),
            sources: Joi.string()
                .trim()
                .allow(null, ''),
            statuses: Joi.string()
                .trim()
                .allow(null, ''),
            created_by: Joi.string()
                .trim()
                .allow(null, ''),
            min_created_at: Joi.date()
                .allow(null, ''),
            max_created_at: Joi.date()
                .allow(null, ''),
            min_total_price: Joi.number()
                .allow(null, ''),
            max_total_price: Joi.number()
                .allow(null, ''),
            min_total_paid: Joi.number()
                .allow(null, ''),
            max_total_paid: Joi.number()
                .allow(null, ''),
            min_total_unpaid: Joi.number()
                .allow(null, ''),
            max_total_unpaid: Joi.number()
                .allow(null, ''),
            keyword: Joi.string()
                .trim()
                .allow(null, '')
        }
    },
    createValidation: {
        body: {
            // attributes
            name: Joi.string()
                .max(100)
                .allow(null, ''),
            type: Joi.string()
                .only(values(Order.Types))
                .required(),
            images: Joi.array()
                .items(Joi.string())
                .allow(null, ''),
            note: Joi.object(
                {
                    system: Joi.string().allow(null, ''),
                    customer: Joi.string().allow(null, '')
                }
            ).allow(null, ''),

            // order info
            store: Joi.object(
                {
                    id: Joi.string().required(),
                    name: Joi.string().allow(null, ''),
                    phone: Joi.string().allow(null, ''),
                    address: Joi.string().allow(null, '')
                }
            ).required(),
            customer: Joi.object(
                {
                    id: Joi.string().required(),
                    name: Joi.string().allow(null, ''),
                    phone: Joi.string().allow(null, ''),
                    address: Joi.string().allow(null, '')
                }
            ).required(),
            products: Joi.array()
                .items({
                    id: Joi.string()
                        .required(),
                    owner: Joi.object({
                        id: Joi.string().required(),
                        name: Joi.string().allow(null, ''),
                        phone: Joi.string().allow(null, ''),
                        address: Joi.string().allow(null, '')
                    }).allow(null, ''),
                    note: Joi.object({
                        customer: Joi.string().allow(null, ''),
                        system: Joi.string().allow(null, '')
                    }).allow(null, ''),

                    // payment management
                    currency: Joi.string()
                        .default('vnd')
                        .allow(null, ''),
                    price: Joi.number()
                        .min(0)
                        .required(),
                    total_quantity: Joi.number()
                        .min(1)
                        .required(),
                    total_discount: Joi.number()
                        .min(0)
                        .allow(null, ''),
                    price_before_discount: Joi.number()
                        .min(0)
                        .required(),
                    total_service_price: Joi.number()
                        .min(0)
                        .required(),
                    total_price: Joi.number()
                        .min(0)
                        .required(),

                    // owner design
                    metrics: Joi.object({})
                        .allow(null, ''),
                    body_notes: Joi.object({})
                        .allow(null, ''),

                    // process management
                    status: Joi.forbidden(),
                    receive_process: Joi.object(
                        {
                            date: Joi.date().allow(null, ''),
                            address: Joi.string().allow(null, '')
                        }
                    ).allow(null, ''),
                    preview_process: Joi.object(
                        {
                            one: Joi.date().allow(null, ''),
                            two: Joi.date().allow(null, ''),
                            three: Joi.date().allow(null, ''),
                            address: Joi.string().allow(null, ''),
                        }
                    ).allow(null, ''),
                    cut_process: Joi.object(
                        {
                            complete_by: Joi.string().allow(null, ''),
                            complete_at: Joi.date().allow(null, ''),
                            point: Joi.number().allow(null, '')
                        }
                    ).allow(null, ''),
                    prepare_process: Joi.object(
                        {
                            complete_by: Joi.string().allow(null, ''),
                            complete_at: Joi.date().allow(null, ''),
                            point: Joi.number().allow(null, '')
                        }
                    ).allow(null, ''),
                    sew_process: Joi.object(
                        {
                            complete_by: Joi.string().allow(null, ''),
                            complete_at: Joi.date().allow(null, ''),
                            point: Joi.number().allow(null, '')
                        }
                    ).allow(null, ''),
                    kcs_one_process: Joi.object(
                        {
                            complete_by: Joi.string().allow(null, ''),
                            complete_at: Joi.date().allow(null, ''),
                            point: Joi.number().allow(null, '')
                        }
                    ).allow(null, ''),
                    complete_process: Joi.object(
                        {
                            complete_by: Joi.string().allow(null, ''),
                            complete_at: Joi.date().allow(null, ''),
                            point: Joi.number().allow(null, '')
                        }
                    ).allow(null, ''),
                    kcs_two_process: Joi.object(
                        {
                            complete_by: Joi.string().allow(null, ''),
                            complete_at: Joi.date().allow(null, ''),
                            point: Joi.number().allow(null, '')
                        }
                    ).allow(null, ''),
                    storage_process: Joi.object(
                        {
                            complete_by: Joi.string().allow(null, ''),
                            complete_at: Joi.date().allow(null, ''),
                            location: Joi.string().allow(null, '')
                        }
                    ).allow(null, '')
                })
                .min(1)
                .required(),

            // process management
            status: Joi.string()
                .only(values(Order.Statuses))
                .allow(null, ''),
            deadline: Joi.date()
                .allow(null, ''),
            measure_process: Joi.object(
                {
                    complete_by: Joi.string().allow(null, ''),
                    complete_at: Joi.date().allow(null, ''),
                    scheduled_at: Joi.date().allow(null, ''),
                    point: Joi.number().allow(null, '')
                }
            ).allow(null, ''),
            consult_process: Joi.object(
                {
                    complete_by: Joi.string().allow(null, ''),
                    complete_at: Joi.date().allow(null, ''),
                    point: Joi.number().allow(null, '')
                }
            ).allow(null, ''),
            receive_process: Joi.object(
                {
                    address: Joi.string().allow(null, ''),
                    date: Joi.string().allow(null, '')
                }
            ).allow(null, ''),
            preview_process: Joi.object(
                {
                    one: Joi.string().allow(null, ''),
                    two: Joi.string().allow(null, ''),
                    three: Joi.string().allow(null, ''),
                    address: Joi.string().allow(null, '')
                }
            ).allow(null, ''),

            // payment management
            currency: Joi.string()
                .default('vnd')
                .allow(null, ''),
            price_before_discount: Joi.number()
                .allow(null, ''),
            total_coin: Joi.number()
                .allow(null, ''),
            total_point: Joi.number()
                .allow(null, ''),
            total_price: Joi.number()
                .allow(null, ''),
            total_discount: Joi.number()
                .allow(null, ''),
            total_paid: Joi.number()
                .allow(null, ''),
            total_unpaid: Joi.number()
                .allow(null, ''),
            payment_method: Joi.number()
                .integer()
                .only(values(Order.PaymentMethods))
                .allow(null, ''),
            shipping_method: Joi.number()
                .integer()
                .only(values(Order.ShipMethods))
                .allow(null, ''),

            // manager
            source: Joi.string()
                .max(50)
                .only(values(Order.Sources))
                .required(),
            device: Joi.string()
                .max(255)
                .required()
        }
    },
    updateValidation: {
        body: {
            // attributes
            name: Joi.string()
                .max(100)
                .allow(null, ''),
            images: Joi.array()
                .items(Joi.string())
                .allow(null, ''),
            note: Joi.object(
                {
                    system: Joi.string().allow(null, ''),
                    customer: Joi.string().allow(null, '')
                }
            ).allow(null, ''),

            // process management
            deadline: Joi.date()
                .allow(null, ''),
            measure_process: Joi.object(
                {
                    complete_by: Joi.string().allow(null, ''),
                    complete_at: Joi.date().allow(null, ''),
                    scheduled_at: Joi.date().allow(null, ''),
                    point: Joi.number().allow(null, '')
                }
            ).allow(null, ''),
            consult_process: Joi.object(
                {
                    complete_by: Joi.string().allow(null, ''),
                    complete_at: Joi.date().allow(null, ''),
                    point: Joi.number().allow(null, '')
                }
            ).allow(null, ''),
            receive_process: Joi.object(
                {
                    address: Joi.string().allow(null, ''),
                    date: Joi.string().allow(null, '')
                }
            ).allow(null, ''),
            preview_process: Joi.object(
                {
                    one: Joi.string().allow(null, ''),
                    two: Joi.string().allow(null, ''),
                    three: Joi.string().allow(null, ''),
                    address: Joi.string().allow(null, '')
                }
            ).allow(null, ''),
        }
    },
    confirmValidation: {
        params: {
            id: Joi.string()
                .required()
        }
    },
    cancelValidation: {
        params: {
            id: Joi.string()
                .required()
        }
    },
    paymentValidation: {
        params: {
            id: Joi.string()
                .required()
        },
        body: {
            method: Joi.number()
                .only(values(Order.PaymentMethods))
                .required(),
            paid: Joi.number()
                .required(),
            store: Joi.object(
                {
                    id: Joi.string().required(),
                    name: Joi.string().allow(null, ''),
                    phone: Joi.string().allow(null, ''),
                    address: Joi.string().allow(null, '')
                }
            ).required(),
            card: Joi.object(
                {
                    name: Joi.string()
                        .required(),
                    number: Joi.string()
                        .required(),
                    expiry: Joi.string()
                        .default(null)
                        .allow(null, ''),
                    cvc: Joi.string()
                        .default(null)
                        .allow(null, '')
                }
            ).allow(null, '')
        }
    }
};
