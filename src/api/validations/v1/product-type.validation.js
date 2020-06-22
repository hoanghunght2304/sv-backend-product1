import Joi from 'joi';

module.exports = {

    // GET v1/material-type
    listValidation: {
        query: {
            keyword: Joi.string()
                .trim()
                .allow(null, ''),
            skip: Joi.number()
                .min(0)
                .default(0),
            limit: Joi.number()
                .min(1)
                .max(1000)
                .default(20),
            start_time: Joi.date()
                .allow(null, ''),
            end_time: Joi.date()
                .allow(null, ''),
            by_date: Joi.string()
                .only('create', 'update')
        }
    },

    // POST v1/material-types
    createValidation: {
        body: {
            id: Joi.string()
                .max(100)
                .required(),
            name: Joi.string()
                .max(100)
                .required(),
            description: Joi.string()
                .max(500)
                .allow(null, ''),
        }
    },

    // PUT v1/material-types/:id
    updateValidation: {
        body: {
            name: Joi.string()
                .min(1)
                .max(100)
                .allow(null, ''),
            description: Joi.string()
                .min(1)
                .max(255)
                .allow(null, ''),
        }
    }
};
