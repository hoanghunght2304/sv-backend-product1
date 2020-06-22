/* eslint-disable indent */
/* eslint-disable no-param-reassign */
import httpStatus from 'http-status';
import moment from 'moment-timezone';
import { Model, DataTypes, Op } from 'sequelize';
import { isEqual, includes, values, pick, keys, isNil, omitBy } from 'lodash';

import postgres from '../../config/postgres';
import { serviceName, env } from '../../config/vars';
import APIException from '../utils/APIException';
import messages from '../../config/messages';
import eventBus from '../services/events/event-bus';
import PriceBook from './price-book.model';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class Product extends Model { }

/**
 * Type of item
 */
Product.ItemTypes = {
    TAILOR: 'tailor',
    AVAILABLE: 'available',
    WARRANTY: 'warranty',
    REPAIR: 'repair'
};

/**
 * Currencies of item
 */
Product.Currencies = {
    VND: 'VND',
    USD: 'USD'
};

/**
 * Units of item
 */
Product.Units = {
    CAI: 'cái',
    BO: 'bộ',
    DOI: 'đôi',
    CHIEC: 'chiếc'
};

Product.Brands = {
    DUNNIO: 'dunnio',
    DUYNGUYEN: 'duynguyen'
};

Product.Genders = {
    MALE: 'male',
    FEMALE: 'female'
};

Product.Groups = {
    PRODUCT: 'product',
    MATERIAL: 'material'
};

/**
 * Item Schema
 * @public
 */
Product.init(
    {
        id: {
            type: DataTypes.STRING(50),
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        type: {
            type: DataTypes.STRING(24),
            values: values(Product.ItemTypes),
            allowNull: false
        },
        group: {
            type: DataTypes.STRING(24),
            values: values(Product.Groups),
            defaultValue: Product.Groups.PRODUCT
        },
        barcode: {
            type: DataTypes.STRING(24),
            defaultValue: null
        },
        description: {
            type: DataTypes.TEXT,
            defaultValue: null
        },
        images: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: []
        },
        relates: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: []
        },

        // attribute
        properties: {
            type: DataTypes.JSONB,
            defaultValue: {
                unit: Product.Units.CAI,
                brand: Product.Brands.DUNNIO,
                gender: Product.Genders.FEMALE
            }
        },
        category_id: {
            type: DataTypes.STRING(50),
            defaultValue: null
        },
        category_two_id: {
            type: DataTypes.STRING(50),
            defaultValue: null
        },
        category_three_id: {
            type: DataTypes.STRING(50),
            defaultValue: null
        },

        // price
        currency: {
            type: DataTypes.STRING(25),
            values: values(Product.Currencies),
            defaultValue: Product.Currencies.VND
        },
        origin_price: {
            type: DataTypes.INTEGER,
            defaultValue: null
        },
        service_price: {
            type: DataTypes.JSONB,
            defaultValue: null
        },
        // only for item group material
        price_books: {
            type: DataTypes.ARRAY(DataTypes.STRING(24)),
            defaultValue: []
        },
        price: {
            type: DataTypes.INTEGER,
            defaultValue: null
        },

        // design
        fabric: {
            type: DataTypes.JSONB,
            defaultValue: {
                id: null,
                name: null,
                content: null,
                image: null,
                price: 0
            }
        },
        design_styles: {
            type: DataTypes.JSONB,
            defaultValue: null
        },
        design_extras: {
            type: DataTypes.JSONB,
            defaultValue: null
        },
        design_advances: {
            type: DataTypes.JSONB,
            defaultValue: null
        },

        // website
        metadata: {
            type: DataTypes.JSONB,
            defaultValue: {
                og_url: null,
                og_title: null,
                og_image: null,
                og_description: null
            }
        },
        statistic: {
            type: DataTypes.JSONB,
            defaultValue: {
                view_count: 0,
                like_count: 0,
                order_count: 0
            }
        },

        // manager
        is_hot_trend: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_public: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        created_by: {
            type: DataTypes.JSONB,
            defaultValue: {
                id: null,
                name: null
            }
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: () => new Date()
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: () => new Date()
        },
        warranty_expired_at: {
            type: DataTypes.DATE,
            defaultValue: null
        }
    },
    {
        timestamps: false,
        sequelize: sequelize,
        modelName: 'Product',
        tableName: 'tbl_products'
    }
);

/**
 * Register event emiter
 */
Product.EVENT_SOURCE = `${serviceName}.product`;
Product.Events = {
    PRODUCT_CREATED: `${serviceName}.product.product_created`,
    PRODUCT_UPDATED: `${serviceName}.product.product_updated`,
    PRODUCT_DELETED: `${serviceName}.product.product_deleted`
};

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
Product.addHook('afterCreate', (model, options) => {
    const { operations } = options;
    const { parts, prices } = operations;

    eventBus.emit(
        Product.Events.PRODUCT_CREATED,
        {
            model: model.dataValues,
            parts: parts,
            prices: prices
        }
    );
});

Product.addHook('afterUpdate', (model, options) => {
    const { operations } = options;
    const { parts, prices, updated_by } = operations;

    // pipe data
    const newModel = model.dataValues;
    const oldModel = model._previousDataValues;
    const dataChanged = keys(model._changed);

    eventBus.emit(
        Product.Events.PRODUCT_UPDATED,
        {
            user: updated_by,
            prices: prices,
            parts: parts,
            model: {
                id: newModel.id,
                old: pick(oldModel, dataChanged),
                new: pick(newModel, dataChanged),
            }
        }
    );
});

Product.addHook('afterDestroy', (model, options) => {
    const oldModel = model.dataValues;
    const { updated_by } = options;

    eventBus.emit(
        Product.Events.PRODUCT_DELETED,
        {
            user: updated_by,
            model: oldModel
        }
    );
});


/**
 * Check min or max in condition
 * @param {*} options
 * @param {*} field
 * @param {*} type
 */
function checkMinMaxOfConditionFields(options, field, type = 'Number') {
    let _min = null;
    let _max = null;

    // Transform min max
    if (type === 'Date') {
        const start = new Date(options[`min_${field}`]);
        _min = start.setHours(0, 0, 0, 0);

        const end = new Date(options[`max_${field}`]);
        _max = end.setHours(23, 59, 59, 999);
    } else {
        _min = parseFloat(options[`min_${field}`]);
        _max = parseFloat(options[`max_${field}`]);
    }

    // Transform condition
    if (
        !isNil(options[`min_${field}`]) ||
        !isNil(options[`max_${field}`])
    ) {
        console.log(options[`min_${field}`]);
        if (
            options[`min_${field}`] &&
            !options[`max_${field}`]
        ) {
            console.log('if');
            options[field] = {
                [Op.gte]: _min
            };
        } else if (
            !options[`min_${field}`] &&
            options[`max_${field}`]
        ) {
            console.log('else if');
            options[field] = {
                [Op.lte]: _max
            };
        } else {
            options[field] = {
                [Op.gte]: _min || 0,
                [Op.lte]: _max || 0
            };
        }
    }

    // Remove first condition
    delete options[`max_${field}`];
    delete options[`min_${field}`];
}

/**
 * Load query
 * @param {*} params
 */
function filterConditions(params) {
    const options = omitBy(params, isNil);
    options.is_active = true;

    // TODO: load condition
    if (options.id) {
        options.id = {
            [Op.iLike]: `%${options.id}%`
        };
    }

    if (options.name) {
        options.name = {
            [Op.iLike]: `%${options.name}%`
        };
    }

    if (options.groups) {
        options.group = {
            [Op.in]: options.groups.split(',')
        };
    }
    delete options.groups;

    if (options.types) {
        options.type = {
            [Op.in]: options.types.split(',')
        };
    }
    delete options.types;

    if (options.categories) {
        options[Op.or] = [
            {
                category_id: { [Op.in]: options.categories.split(',') }
            },
            {
                category_two_id: { [Op.in]: options.categories.split(',') }
            },
            {
                category_three_id: { [Op.in]: options.categories.split(',') }
            }
        ];
    }
    delete options.categories;

    if (
        options.min_created_at &&
        options.max_created_at
    ) {
        checkMinMaxOfConditionFields(options, 'created_at', 'Date');
    }

    return options;
}

/**
 * Load raw query
 * @param {*} params
 */
function filterRawConditions(params) {
    const options = omitBy(params, isNil);
    let rawQueries = 'p.is_active = true \n';

    // parse raw query
    if (options.id) {
        rawQueries += 'AND p.id = :id \n';
    }
    if (options.name) {
        rawQueries += 'AND p.name = :name \n';
    }
    if (options.is_public) {
        rawQueries += 'AND p.is_public = :is_public \n';
    }
    if (options.is_hot_trend) {
        rawQueries += 'AND p.is_hot_trend = :is_hot_trend \n';
    }
    if (options.min_created_at && options.max_created_at) {
        options.min_created_at.setHours(0, 0, 0, 0);
        options.max_created_at.setHours(23, 59, 59, 999);
        rawQueries += 'AND p.created_at BETWEEN (:min_created_at) AND (:max_created_at) \n';
    }
    if (options.groups) {
        rawQueries += 'AND p.group IN (:groups) \n';
    }
    if (options.types) {
        rawQueries += 'AND p.type IN (:types) \n';
    }
    if (options.categories) {
        rawQueries += 'AND (p.category_id IN (:categories) OR p.category_two_id IN (:categories) \n)';
    }

    return rawQueries;
}

/**
 * Load sort query
 * @param {*} sort_by
 * @param {*} order_by
 */
// eslint-disable-next-line no-unused-vars
function sortConditions({ sort_by, order_by }) {
    let sort = null;
    switch (sort_by) {
        case 'created_at':
            sort = ['created_at', order_by];
            break;
        case 'updated_at':
            sort = ['updated_at', order_by];
            break;
        default: sort = ['created_at', 'DESC'];
            break;
    }
    return sort;
}

/**
 * Transform mongoose model to expose object
 */
Product.transform = (model) => {
    const transformed = {};
    const fields = [
        // attributes
        'id',
        'name',
        'type',
        'group',
        'barcode',
        'description',
        'category_id',
        'category_two_id',
        'category_three_id',
        'properties',
        'relates',
        'images',

        // price
        'currency',
        'origin_price',
        'service_price',
        'price',

        // design
        'fabric',
        'design_styles',
        'design_extras',
        'design_advances',

        // website
        'metadata',
        'statistic',

        // additional
        'parts',
        'price_books',
        'inventories',

        // manager
        'is_hot_trend',
        'is_public',
        'is_active',
        'created_by',
        'warranty_expired_at',
        'created_at',
        'updated_at'
    ];

    fields.forEach((field) => {
        transformed[field] = model[field];
    });

    transformed.created_at = moment(model.created_at).unix();
    transformed.updated_at = moment(model.updated_at).unix();
    return transformed;
};

/**
 * Get all changed properties
 *
 * @public
 * @param {Object} data newModel || oleModel
 */
Product.getChangedProperties = ({ newModel, oldModel }) => {
    const changedProperties = [];
    const allChangableProperties = [
        // attributes
        'name',
        'barcode',
        'description',
        'category_id',
        'category_two_id',
        'category_three_id',
        'properties',
        'images',

        // price
        'currency',
        'origin_price',
        'service_price',
        'price',

        // design
        'fabric',
        'design_styles',
        'design_extras',
        'design_advances',

        // seo
        'metadata',

        // manager
        'is_public',
        'is_hot_trend',
    ];

    /** get all changable properties */
    Object.keys(newModel).forEach((field) => {
        if (includes(allChangableProperties, field)) {
            changedProperties.push(field);
        }
    });

    /** get data changed */
    const dataChanged = [];
    changedProperties.forEach(field => {
        if (!isEqual(newModel[field], oldModel[field])) {
            dataChanged.push(field);
        }
    });

    return dataChanged;
};

/**
 * Get Detail By Id
 *
 * @public
 * @param {String} id
 */
Product.getProductById = async (id) => {
    try {
        const product = await Product.findByPk(
            id
        );
        if (!product) {
            throw new APIException({
                status: httpStatus.NOT_FOUND,
                message: messages.NOT_FOUND
            });
        }
        const priceBooks = await PriceBook.list({
            ids: product.price_books
        });

        return Object.assign(
            product,
            {
                price_books: priceBooks.map(
                    x => PriceBook.transform(x)
                )
            }
        );
    } catch (ex) {
        throw (ex);
    }
};

/**
 * Get list products
 *
 * @public
 * @param {Parameters} params
 */
Product.list = async ({
    id,
    name,
    types,
    groups,
    categories,
    min_created_at,
    max_created_at,
    is_hot_trend,
    is_public,

    // $sort
    skip = 0,
    limit = 20,
}) => {
    try {
        const options = filterRawConditions({
            id,
            name,
            types,
            groups,
            categories,
            min_created_at,
            max_created_at,
            is_hot_trend,
            is_public
        });
        const result = await Product.sequelize.query(
            `
                SELECT 
                    p.*,
                    COALESCE (
                        jsonb_agg(
                            jsonb_build_object(
                                'id', pb.id,
                                'name', pb.name,
                                'categories', pb.categories
                            )
                        )
                        FILTER (WHERE pb.id IS NOT NULL), '[]'
                    ) AS price_books,
                    COALESCE (
                        jsonb_agg(
                            jsonb_build_object(
                                'id', i.store_id,
                                'total_quanity', i.total_quantity
                            )
                        )
                        FILTER (WHERE i.store_id IS NOT NULL), '[]'
                    ) AS inventories
                FROM tbl_products AS p
                    LEFT JOIN tbl_inventories AS i ON i.item_id = p.id
                    LEFT JOIN tbl_price_books AS pb ON pb.id = ANY(p.price_books)
                WHERE ${options}
                GROUP BY p.id
                ORDER BY p.created_at DESC
                OFFSET ${skip} LIMIT ${limit}
            `,
            {
                replacements: {
                    id,
                    name,
                    types: types ? types.split(',') : [],
                    groups: groups ? groups.split(',') : [],
                    categories: categories ? categories.split(',') : [],
                    min_created_at,
                    max_created_at,
                    is_hot_trend,
                    is_public
                }
            }
        );

        return result[1].rows;
    } catch (ex) {
        throw (ex);
    }
};

/**
 * Count list filters
 *
 * @public
 * @param {Parameters} params
 */
Product.countQueries = async ({
    id,
    name,
    types,
    groups,
    categories,
    min_created_at,
    max_created_at,
    is_hot_trend,
    is_public,
}) => {
    try {
        const options = filterConditions({
            id,
            name,
            types,
            groups,
            categories,
            min_created_at,
            max_created_at,
            is_hot_trend,
            is_public,
        });
        return Product.count({
            where: options
        });
    } catch (ex) {
        throw (ex);
    }
};

/**
 * Check Duplicate ID
 *
 * @public
 * @param id
 */
Product.checkDuplicateId = async (id) => {
    try {
        const product = await Product.findByPk(id);
        if (product) {
            throw new APIException({
                status: httpStatus.BAD_REQUEST,
                message: messages.product_EXISTS
            });
        }
        return true;
    } catch (ex) {
        throw (ex);
    }
};

/**
 * Generate table
 */
Product.sync({
    alter: true,
    logging: env === 'development'
});

/**
 * @typedef Product
 */
export default Product;
