import Joi from 'joi';
import StockTake from '../../../common/models/stock-take.model';

module.exports = {
    // GET v1/stock-take
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
                .allow(null, ''),
            stores: Joi.string()
                .trim()
                .allow(null, ''),
            statuses: Joi.string()
                .trim()
                .allow(null, ''),

            /** date filter */
            by_date: Joi.string()
                .only('update', 'create')
                .default('create')
                .allow(null, ''),
            start_time: Joi.date()
                .allow(null, ''),
            end_time: Joi.date()
                .allow(null, ''),

            /** sortting */
            sort_by: Joi.string()
                .only(['create', 'update'])
                .default('create')
                .allow(null, ''),
            order_by: Joi.string()
                .only(['asc', 'desc'])
                .default('desc')
                .allow(null, '')
        }
    },

    // POST v1/stock
    createValidation: {
        body: {
            status: Joi.forbidden(),

            /** attributes */
            note: Joi.string()
                .max(500)
                .required(),
            reason: Joi.string()
                .max(255)
                .default(null),

            /** detail */
            store: Joi.object({
                id: Joi.string()
                    .required(),
                name: Joi.string()
                    .required(),
                phone: Joi.string()
                    .required(),
                address: Joi.string()
                    .default('')
            }).required(),
            total_adjustment: Joi.number()
                .default(0),
            total_actual: Joi.number()
                .default(0),
            items: Joi.array()
                .items({
                    id: Joi.string()
                        .lowercase()
                        .required(),
                    total_actual: Joi.number()
                        .default(0),
                    total_quantity: Joi.number()
                        .default(0),
                    total_adjustment: Joi.number()
                        .default(0)
                })
                .min(1)
                .required(),
        }
    },

    // PUT v1/stock
    updateValidation: {
        body: {
            note: Joi.string()
                .max(500)
                .required(),
            reason: Joi.string()
                .max(255)
                .default(null),

        }
    },

    // POST v1/stock/cancle/:id
    cancelValidation: {
        body: {
            status: Joi.string()
                .only(StockTake.Statuses.CANCELLED)
                .default(StockTake.Statuses.CANCELLED),
            reason: Joi.string()
                .required()
        }
    },

    // POST v1/stock/confirm/:id
    confirmValidation: {
        body: {
            status: Joi.string()
                .only(StockTake.Statuses.CONFIRMED)
                .default(StockTake.Statuses.CONFIRMED),
            reason: Joi.string()
                .allow(null, ''),
            confirmed_at: Joi.date()
                .allow(null, '')
        }
    }
};
