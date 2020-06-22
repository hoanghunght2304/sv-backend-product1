import Joi from 'joi';
import { values } from 'lodash';
import Export from '../../../common/models/export.model';

const phoneRegex = /^\+?[0-9]{9,15}$/;

module.exports = {
    // GET v1/exports
    listValidation: {
        query: {
            skip: Joi.number()
                .min(0)
                .default(0),
            limit: Joi.number()
                .min(10)
                .max(5000)
                .default(20),
            keyword: Joi.string()
                .trim()
                .allow(''),
            types: Joi.string()
                .trim()
                .allow(null, ''),
            sources: Joi.string()
                .trim()
                .allow(''),
            stores: Joi.string()
                .trim()
                .allow(''),
            statuses: Joi.string()
                .trim()
                .allow(''),

            // date filters
            by_date: Joi.string()
                .only('delivery', 'received')
                .allow(null, ''),
            start_time: Joi.date()
                .allow(null, ''),
            end_time: Joi.date()
                .allow(null, '')
        }
    },

    // GET v1/exports/process
    processValidation: {
        query: {
            skip: Joi.number()
                .min(0)
                .default(0),
            limit: Joi.number()
                .min(10)
                .max(5000)
                .default(20),
            keyword: Joi.string()
                .trim()
                .allow(''),
            item_types: Joi.string()
                .trim()
                .allow('')
        }
    },

    // POST v1/exports
    createValidation: {
        body: {
            /** attributes */
            note: Joi.string()
                .trim()
                .max(500)
                .required(),
            type: Joi.number()
                .only(values(Export.Types))
                .required(),
            reason: Joi.string()
                .allow(null, '')
                .max(255)
                .default(null),

            /** detail */
            source: Joi.object()
                .keys({
                    id: Joi.string()
                        .required(),
                    name: Joi.string()
                        .required(),
                    phone: Joi.string()
                        .min(10)
                        .max(20)
                        .regex(phoneRegex)
                        .required(),
                    address: Joi.string()
                        .default(''),
                })
                .allow(null, ''),
            store: Joi.object()
                .keys({
                    id: Joi.string()
                        .required(),
                    name: Joi.string()
                        .required(),
                    phone: Joi.string()
                        .min(10)
                        .max(20)
                        .regex(phoneRegex)
                        .required(),
                    address: Joi.string()
                        .default(''),
                })
                .allow(null, ''),
            items: Joi.array()
                .items({
                    id: Joi.string()
                        .lowercase()
                        .required(),
                    total_quantity: Joi.number()
                        .min(1)
                        .required(),
                    total_price: Joi.number()
                        .required(),
                })
                .min(1)
                .required(),
            received_at: Joi.date()
                .allow(null, '')
                .only(null)
                .default(null),
            total_quantity: Joi.number()
                .allow(null, '')
                .default(0),
            total_price: Joi.number()
                .allow(null, '')
                .default(0)
        }
    },

    // POST v1/exports
    updateValidation: {
        body: {
            note: Joi.string()
                .max(500)
                .allow(null, ''),
            reason: Joi.string()
                .max(255)
                .allow(null, '')
        }
    },

    // POST v1/exports/cancle/:id
    cancelValidation: {
        body: {
            status: Joi.string()
                .only(Export.Statuses.CANCELLED)
                .default(Export.Statuses.CANCELLED),
            reason: Joi.string()
                .required()
        }
    },

    // POST v1/exports/return/:id
    returnValidation: {
        body: {
            status: Joi.string()
                .only(Export.Statuses.RETURNING)
                .default(Export.Statuses.RETURNING),
            reason: Joi.string()
                .allow(null, '')
        }
    },

    // POST v1/exports/confirm/:id
    confirmValidation: {
        body: {
            status: Joi.string()
                .only([
                    Export.Statuses.RETURNED, // for sender
                    Export.Statuses.CONFIRMED // for receiver
                ])
                .required(),
            reason: Joi.string()
                .allow(null, ''),
            received_at: Joi.date()
                .allow(null, '')
        }
    }
};
