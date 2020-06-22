import Joi from 'joi';
import { values } from 'lodash';
import Import from '../../../common/models/import.model';

const phoneRegex = /^\+?[0-9]{9,15}$/;

module.exports = {
    // GET v1/imports
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
            stores: Joi.string()
                .trim()
                .allow(null, ''),
            statuses: Joi.string()
                .trim()
                .allow(null, ''),

            // date filters
            start_time: Joi.date()
                .allow(null, ''),
            end_time: Joi.date()
                .allow(null, ''),
        }
    },

    // POST v1/imports
    createValidation: {
        body: {
            /** ipmort attributes */
            note: Joi.string()
                .trim()
                .max(500)
                .required(),
            reason: Joi.string()
                .allow(null, '')
                .max(255)
                .default(null),
            /** import detail */
            source: Joi.object()
                .keys({
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
                .required(),
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
                .required(),
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
            status: Joi.string()
                .only(values(Import.Statuses))
                .default(Import.Statuses.CHECKING),
            total_quantity: Joi.number()
                .allow(null, '')
                .default(0),
            total_price: Joi.number()
                .allow(null, '')
                .default(0)
        }
    },

    // POST v1/imports
    updateValidation: {
        body: {
            /** ipmort attributes */
            note: Joi.string()
                .trim()
                .max(500)
                .allow(null, ''),
            reason: Joi.string()
                .max(255)
                .default(null)
                .allow(null, ''),
            /** import detail */
            source: Joi.object()
                .keys({
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
        }
    },

    // POST v1/imports/cancle/:id
    cancelValidation: {
        body: {
            status: Joi.string()
                .only(Import.Statuses.CANCELLED)
                .default(Import.Statuses.CANCELLED),
            reason: Joi.string()
                .required()
        }
    },

    // POST v1/imports/confirm/:id
    confirmValidation: {
        body: {
            status: Joi.string()
                .only(Import.Statuses.CONFIRMED)
                .default(Import.Statuses.CONFIRMED),
            reason: Joi.string()
                .allow(null, '')
        }
    }
};
