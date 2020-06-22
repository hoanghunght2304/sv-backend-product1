import Joi from 'joi';

const phoneRegex = /^\+?[0-9]{9,15}$/;

module.exports = {

    // GET v1/store
    listValidation: {
        query: {
            skip: Joi.number()
                .min(0)
                .default(0),
            limit: Joi.number()
                .min(10)
                .max(500)
                .default(20),
            keyword: Joi.string()
                .trim()
                .allow(null, ''),
            by_date: Joi.string()
                .default('create')
                .allow(null, ''),
            start_time: Joi.date()
                .allow(null, ''),
            end_time: Joi.date()
                .allow(null, '')
        }
    },

    // POST v1/store
    createValidation: {
        body: {
            id: Joi.string()
                .max(50)
                .trim()
                .required(),
            name: Joi.string()
                .trim()
                .max(100)
                .required(),
            logo: Joi.string()
                .allow(null, '')
                .max(255)
                .default('https://cdn.dunnio.com/storages/logo/default.jpg'),
            phone: Joi.string()
                .min(10)
                .max(20)
                .regex(phoneRegex)
                .required(),
            email: Joi.string()
                .trim()
                .max(255)
                .regex(/^\S+@\S+\.\S+$/)
                .lowercase()
                .allow(null, '')
                .default(null),
            address: Joi.string()
                .max(500)
                .default(null)
                .allow(null, ''),
            description: Joi.string()
                .trim()
                .max(500)
                .default(null)
                .allow(null, '')
        }
    },

    // PUST v1/store
    updateValidation: {
        body: {
            name: Joi.string()
                .trim()
                .max(100)
                .allow(null, ''),
            logo: Joi.string()
                .max(255)
                .allow(null, ''),
            phone: Joi.string()
                .min(10)
                .max(20)
                .regex(phoneRegex)
                .allow(null, ''),
            email: Joi.string()
                .trim()
                .max(255)
                .regex(/^\S+@\S+\.\S+$/)
                .lowercase()
                .allow(null, ''),
            address: Joi.string()
                .max(500)
                .allow(null, ''),
            description: Joi.string()
                .trim()
                .max(500)
                .allow(null, ''),
        }
    }
};
