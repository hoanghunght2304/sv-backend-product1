import Joi from 'joi';
import { values } from 'lodash';
import Product from '../../../common/models/product.model';

module.exports = {

    // GET v1/items
    listValidation: {
        query: {
            skip: Joi.number()
                .default(0)
                .min(0),
            limit: Joi.number()
                .default(10)
                .min(10),
            is_public: Joi.bool(),
            is_hot_trend: Joi.bool(),
            id: Joi.string()
                .trim()
                .allow(null, ''),
            name: Joi.string()
                .trim()
                .allow(null, ''),
            groups: Joi.string()
                .trim()
                .allow(null, ''),
            types: Joi.string()
                .trim()
                .allow(''),
            categories: Joi.string()
                .trim()
                .allow(''),
            min_created_at: Joi.date()
                .allow(null, ''),
            max_created_at: Joi.date()
                .allow(null, '')
        }
    },

    // POST v1/items
    createValidation: {
        body: {
            // forbidden
            warranty_expired_at: Joi.forbidden(),

            id: Joi.string()
                .max(50)
                .lowercase()
                .required(),
            name: Joi.string()
                .max(100)
                .required(),
            type: Joi.when(
                'group',
                {
                    is: Product.Groups.PRODUCT,
                    then: Joi.string()
                        .only(values(Product.ItemTypes)),
                    otherwise: Joi.string()
                        .required()
                }
            ),
            group: Joi.string()
                .only(values(Product.Groups))
                .required(),
            description: Joi.string()
                .allow(null, ''),
            images: Joi.array()
                .items(Joi.string())
                .allow(null, ''),
            relates: Joi.array()
                .items(Joi.string())
                .allow(null, ''),

            // attributes
            properties: Joi.object(
                {
                    unit: Joi.string()
                        .only(values(Product.Units))
                        .default(Product.Units.CAI)
                        .allow(null, ''),
                    brand: Joi.string()
                        .only(values(Product.Brands))
                        .default(Product.Brands.DUNNIO)
                        .allow(null, ''),
                    gender: Joi.string()
                        .only(values(Product.Genders))
                        .default(Product.Genders.FEMALE)
                        .allow(null, ''),
                }
            )
                .allow('', null),
            category_id: Joi.string()
                .allow(null, ''),
            category_two_id: Joi.string()
                .allow(null, '')
                .default(null),
            category_three_id: Joi.string()
                .allow(null, '')
                .default(null),

            // price
            currency: Joi.string()
                .only(values(Product.Currencies))
                .default(Product.Currencies.VND),
            origin_price: Joi.number()
                .min(0)
                .default(0)
                .allow(null, ''),
            service_price: Joi.object()
                .allow(null, '')
                .default(null),
            price: Joi.number()
                .min(0)
                .default(0)
                .allow(null, ''),

            // design
            fabric: Joi.object(
                {
                    id: Joi.string().allow(null, ''),
                    name: Joi.string().allow(null, ''),
                    content: Joi.string().allow(null, ''),
                    image: Joi.string().allow(null, ''),
                    price: Joi.number().min(0).default(0)
                }
            ).allow(null, ''),
            design_styles: Joi.object()
                .default(null)
                .allow(null, ''),
            design_extras: Joi.object()
                .default(null)
                .allow(null, ''),
            design_advances: Joi.object()
                .default(null)
                .allow(null, ''),

            // seo
            metadata: Joi.object({
                og_url: Joi.string()
                    .default(null)
                    .allow(null, ''),
                og_title: Joi.string()
                    .default(null)
                    .allow(null, ''),
                og_image: Joi.string()
                    .default(null)
                    .allow(null, ''),
                og_description: Joi.string()
                    .default(null)
                    .allow(null, '')
            }).allow(null, ''),

            // additional
            parts: Joi.array()
                .items({
                    product_id: Joi.string().required(),
                    material_id: Joi.string().required()
                })
                .allow(null, ''),
            price_books: Joi.array()
                .items(Joi.string())
                .allow(null, ''),

            // manager
            is_public: Joi.bool(),
            is_hot_trend: Joi.bool()
        }
    },

    // PUT v1/items/:id
    updateValidation: {
        body: {
            name: Joi.string()
                .max(100)
                .allow(null, ''),
            description: Joi.string()
                .allow(null, ''),
            images: Joi.array()
                .items(Joi.string())
                .allow(null, ''),
            relates: Joi.array()
                .items(Joi.string())
                .allow(null, ''),

            // attributes
            properties: Joi.object({
                unit: Joi.string()
                    .only(values(Product.Units))
                    .allow(null, ''),
                brand: Joi.string()
                    .only(values(Product.Brands))
                    .allow(null, ''),
                gender: Joi.string()
                    .only(values(Product.Genders))
                    .allow(null, ''),
            }).allow('', null),
            category_id: Joi.string()
                .allow(null, ''),
            category_two_id: Joi.string()
                .allow(null, ''),
            category_three_id: Joi.string()
                .allow(null, ''),

            // price
            currency: Joi.string()
                .only(values(Product.Currencies))
                .allow(null, ''),
            origin_price: Joi.number()
                .min(0)
                .allow(null, ''),
            service_price: Joi.object()
                .allow(null, ''),
            price: Joi.number()
                .min(0)
                .allow(null, ''),

            // design
            fabric: Joi.object(
                {
                    id: Joi.string().allow(null, ''),
                    name: Joi.string().allow(null, ''),
                    content: Joi.string().allow(null, ''),
                    image: Joi.string().allow(null, ''),
                    price: Joi.number().min(0).default(0)
                }
            ).allow(null, ''),
            design_styles: Joi.object()
                .default(null)
                .allow(null, ''),
            design_extras: Joi.object()
                .default(null)
                .allow(null, ''),
            design_advances: Joi.object()
                .default(null)
                .allow(null, ''),

            // seo
            metadata: Joi.object({
                og_url: Joi.string()
                    .default(null)
                    .allow(null, ''),
                og_title: Joi.string()
                    .default(null)
                    .allow(null, ''),
                og_image: Joi.string()
                    .default(null)
                    .allow(null, ''),
                og_description: Joi.string()
                    .default(null)
                    .allow(null, '')
            }).allow(null, ''),

            // manager
            is_public: Joi.bool(),
            is_hot_trend: Joi.bool()
        }
    }
};
