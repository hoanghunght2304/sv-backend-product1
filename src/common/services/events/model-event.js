import { AppEvent, LogEvent } from 'rabbit-event-source';
import { Op } from 'sequelize';

import eventBus from './event-bus';
import { serviceName } from '../../../config/vars';

import Product from '../../models/product.model';
import ProductPart from '../../models/product-part.model';

import Order from '../../models/order.model';
import OrderItem from '../../models/order-item.model';
import Payment from '../../models/payment.model';
import Delivery from '../../models/delivery.model';
import DeliveryItem from '../../models/delivery-item.model';

import Inventory from '../../models/inventory.model';
import Export from '../../models/export.model';
import ExportDetail from '../../models/export-detail.model';
import Import from '../../models/import.model';
import ImportDetail from '../../models/import-detail.model';
import StockTake from '../../models/stock-take.model';
import StockTakeDetail from '../../models/stock-detail.model';

function registerAppEvent() {
    /**
     * Create history event create.
     * @public
     * @param {Object} data
     */
    eventBus.on(AppEvent.Events.APP_EVENT_CREATED, async ({
        source,
        message,
        data,
        user
    }) => {
        try {
            const appEvent = new AppEvent({
                source: source,
                message: message,
                event: AppEvent.Events.APP_EVENT_CREATED,
                created_by: user,
                data: data
            });
            await appEvent.save();
        } catch (ex) {
            console.log(`Cannot create history for ${AppEvent.Events.APP_EVENT_CREATED} at: ${serviceName}`);
            new LogEvent({
                code: ex.code || 500,
                message: `Cannot create history for ${AppEvent.Events.APP_EVENT_CREATED} at: ${serviceName}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        }
    });

    /**
     * Create history event create.
     * @public
     * @param {Object} data
     */
    eventBus.on(AppEvent.Events.APP_EVENT_UPDATED, async ({
        source,
        data,
        message,
        user
    }) => {
        try {
            const appEvent = new AppEvent({
                source: source,
                message: message,
                event: AppEvent.Events.APP_EVENT_UPDATED,
                created_by: user,
                data: data
            });
            await appEvent.save();
        } catch (ex) {
            console.log(`Cannot create history for ${AppEvent.Events.APP_EVENT_UPDATED} at: ${serviceName}`);
            new LogEvent({
                code: ex.code || 500,
                message: `Cannot create history for ${AppEvent.Events.APP_EVENT_UPDATED} at: ${serviceName}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        }
    });

    /**
     * Create history event create.
     * @public
     * @param {Object} data
     */
    eventBus.on(AppEvent.Events.APP_EVENT_DELETED, async ({
        source,
        message,
        data,
        user
    }) => {
        try {
            const appEvent = new AppEvent({
                source: source,
                message: message,
                event: AppEvent.Events.APP_EVENT_DELETED,
                created_by: user,
                data: data
            });
            await appEvent.save();
        } catch (ex) {
            console.log(`Cannot create history for ${AppEvent.Events.APP_EVENT_DELETED} at: ${serviceName}`);
            new LogEvent({
                code: ex.code || 500,
                message: `Cannot create history for ${AppEvent.Events.APP_EVENT_DELETED} at: ${serviceName}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        }
    });

    /**
     * Create history event payment.
     * @public
     * @param {Object} source
     * @param {Object} user
     * @param {Object} data
     */
    eventBus.on(AppEvent.Events.APP_EVENT_PAYMENT, async ({
        source,
        user,
        data
    }) => {
        try {
            let message = '';
            if (data.new.total_unpaid === 0) {
                message = `Đơn hàng: ${data.id} đã được thanh toán xong.`;
            } else {
                message = `Đơn hàng: ${data.id} đã thanh toán thêm ${data.new.payment.total_paid - data.old.payment.total_paid}.`;
            }

            const appEvent = new AppEvent({
                source: source,
                message: message,
                event: AppEvent.Events.APP_EVENT_PAYMENT,
                created_by: user,
                data: data
            });
            await appEvent.save();
        } catch (ex) {
            console.log(`Cannot create history for ${AppEvent.Events.APP_EVENT_PAYMENT} at: ${serviceName}`);
            new LogEvent({
                code: ex.code || 500,
                message: `Cannot create history for ${AppEvent.Events.APP_EVENT_PAYMENT} at: ${serviceName}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        }
    });
}

function registerProductEvent() {
    /**
     * Add parts and prices when product created
     *
     * @param {*} model
     * @param {*} parts
     */
    eventBus.on(Product.Events.PRODUCT_CREATED, async ({ model, parts = [] }) => {
        // TODO: add attributes
        if (parts.length) {
            try {
                await ProductPart.bulkCreate(parts);
            } catch (ex) {
                console.log(`Cannot add parts to product: ${model.id}`);
                new LogEvent({
                    code: ex.code || 500,
                    message: `Cannot add parts to product: ${model.id}`,
                    errors: ex.errors || null,
                    stack: ex.stack || null
                }).save();
            }
        }


        // TODO: add history
        eventBus.emit(
            new AppEvent(
                {
                    source: 'tbl_products',
                    event: AppEvent.Events.APP_EVENT_CREATED,
                    message: `${model.created_by.id} đã tạo mới sản phẩm: ${model.id}`,
                    user: model.created_by,
                    data: model
                }
            ).save()
        );
    });

    /**
     * Add history when product updated
     *
     * @param {*} user
     * @param {*} model
     * @param {*} parts
     */
    eventBus.on(Product.Events.PRODUCT_UPDATED, async ({ user, model, parts = [] }) => {
        if (parts.length) {
            try {
                // remove old
                await ProductPart.destroy({
                    where: {
                        product_id: model.id
                    }
                });

                // add new
                await ProductPart.bulkCreate(
                    parts
                );
            } catch (ex) {
                console.log(`Cannot add parts to product: ${model.id}`);
                new LogEvent({
                    code: ex.code || 500,
                    message: `Cannot add parts to product: ${model.id}`,
                    errors: ex.errors || null,
                    stack: ex.stack || null
                }).save();
            }
        }

        eventBus.emit(
            new AppEvent(
                {
                    source: 'tbl_products',
                    event: AppEvent.Events.APP_EVENT_UPDATED,
                    message: `${user.name} đã cập nhật sản phẩm: ${model.id}`,
                    user: user,
                    data: model
                }
            ).save()
        );
    });

    /**
     * Delete attribute and variation when product deleted
     *
     * @param {*} model
     */
    eventBus.on(Product.Events.PRODUCT_DELETED, ({ user, model }) => {
        ProductPart.destroy({
            where: {
                product_id: model.id
            }
        });

        // TODO: history
        eventBus.emit(
            new AppEvent(
                {
                    source: 'tbl_products',
                    event: AppEvent.Events.APP_EVENT_DELETED,
                    message: `${user.name} đã xóa sản phẩm: ${model.id}`,
                    user: user,
                    data: model
                }
            ).save()
        );
    });
}

function registerOrderEvent() {
    /**
     * Add item to order item when order created
     * @param {*} model
     * @param {*} products
     */
    eventBus.on(Order.Events.ORDER_CREATED, async ({ model, products }) => {
        // TODO: add attributes
        if (products.length) {
            try {
                products.map(element => {
                    const item = element;
                    item.order_id = model.id;
                    item.created_by = model.created_by;
                    return item;
                });
                await OrderItem.bulkCreate(products);
            } catch (ex) {
                console.log(`Cannot add products to order-item: ${model.id}`);
                new LogEvent({
                    code: ex.code || 500,
                    message: `Cannot add products to order-item: ${model.id}`,
                    errors: ex.errors || null,
                    stack: ex.stack || null
                }).save();
            }
        }

        // TODO:: Push message decrement customer point

        // TODO: add history
        new AppEvent(
            {
                source: 'tbl_orders',
                event: AppEvent.Events.APP_EVENT_CREATED,
                message: `${model.created_by.id} đã tạo mới đơn hàng: ${model.id}`,
                user: model.created_by,
                data: model
            }
        ).save();
    });

    /**
     * Log history when order updated
     * @param {*} model
     * @param {*} products
     */
    eventBus.on(Order.Events.ORDER_UPDATED, async ({ user, model }) => {
        // TODO:: Add History
        new AppEvent(
            {
                source: 'tbl_orders',
                event: AppEvent.Events.APP_EVENT_UPDATED,
                message: `${user.name} đã cập nhật đơn hàng: ${model.id}`,
                user: user,
                data: model
            }
        ).save();
    });

    /**
     * Log history when order cancelled
     * @param {*} model
     * @param {*} products
     */
    eventBus.on(Order.Events.ORDER_CANCELLED, async ({ user, model }) => {
        // Cancel process in order item
        await OrderItem.update(
            {
                status: OrderItem.ItemStatuses.CANCELLED,
                updated_at: new Date()
            },
            {
                where: {
                    order_id: model.id
                }
            }
        );

        // TODO:: Add History
        new AppEvent(
            {
                source: 'tbl_orders',
                event: AppEvent.Events.APP_EVENT_UPDATED,
                message: `${user.name} đã hủy đơn hàng: ${model.id}`,
                user: user,
                data: model
            }
        ).save();
    });

    /**
     * Log history when payment
     * @param {*} model
     * @param {*} products
     */
    eventBus.on(Order.Events.ORDER_PAYMENTED, async ({ user, model, params }) => {
        try {
            const { method, card, paid, store } = params;
            const { total_price, total_unpaid } = model;
            await Payment.create({
                card: card,
                method: method,
                order_id: model.id,
                store: store,
                total_paid: paid,
                total_unpaid: total_unpaid,
                total_price: total_price,
                created_by: user
            });
        } catch (ex) {
            console.log(`Cannot add payment for order: ${model.id}`);
            new LogEvent({
                code: ex.code || 500,
                message: `Cannot add payment for order: ${model.id}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        }
    });
}

function registerDeliveryEvent() {
    /**
     * Add item to order item when order created
     * @param {*} model
     * @param {*} products
     */
    eventBus.on(Delivery.Events.DELIVERY_CREATED, async ({ model, products }) => {
        // TODO: add attributes
        if (products.length) {
            try {
                products.map(element => {
                    const item = element;
                    item.delivery_id = model.id;
                    item.product_id = element.id;
                    item.product_name = element.name;
                    item.created_by = model.created_by;
                    delete item.id;
                    return item;
                });

                // add fulfillment
                await DeliveryItem.bulkCreate(
                    products
                );

                // change status when delivered
                await OrderItem.update(
                    {
                        status: OrderItem.ItemStatuses.DELIVERED,
                        updated_at: new Date()
                    },
                    {
                        where: {
                            order_id: model.order_id,
                            product_id: {
                                [Op.in]: products.map(x => x.product_id)
                            }
                        }
                    }
                );

                // open warranty for item tailor
                const dateNow = new Date();
                await Product.update(
                    {
                        warranty_expired_at: new Date(
                            dateNow.getFullYear() + 2,
                            dateNow.getMonth(),
                            dateNow.getDate()
                        )
                    },
                    {
                        where: {
                            id: {
                                [Op.in]: products.map(
                                    x => x.product_id
                                )
                            },
                            group: Product.Groups.PRODUCT,
                            type: Product.ItemTypes.TAILOR
                        }
                    }
                );
            } catch (ex) {
                console.log(`Cannot add products to delivery-item: ${model.id}`);
                new LogEvent({
                    code: ex.code || 500,
                    message: `Cannot add products to delivery-item: ${model.id}`,
                    errors: ex.errors || null,
                    stack: ex.stack || null
                }).save();
            }
        }

        // TODO: add history
        new AppEvent(
            {
                source: 'tbl_deliveries',
                event: AppEvent.Events.APP_EVENT_CREATED,
                message: `${model.created_by.id} đã tạo mới phiếu vận đơn: ${model.id}`,
                user: model.created_by,
                data: model
            }
        ).save();
    });
}

function registerExportEvent() {
    /**
     * Add items to detail when export created
     * @param {*} user
     * @param {*} model
     * @param {*} products
     */
    eventBus.on(Export.Events.EXPORT_CREATED, async ({ user, model, products = [] }) => {
        // TODO:: Calculate quantity
        products.map(async el => {
            const itemInventory = await Inventory.findOne({
                where: {
                    item_id: el.id,
                    store_id: model.source.id // chi nhánh chuyển hàng
                }
            });
            if (itemInventory) {
                await Inventory.increment(
                    {
                        total_quantity: -el.total_quantity
                    },
                    {
                        where: {
                            item_id: el.item_id,
                            store_id: model.source.id,
                        }
                    }
                );
            } else {
                await Inventory.create({
                    item_id: el.item_id,
                    total_quantity: -el.total_quantity,
                    store_id: model.source.id,
                    created_by: user
                });
            }
        });

        // TODO:: Add products to detail
        try {
            const operations = [];
            products.forEach(item => {
                const product = item;
                product.item_id = item.id;
                product.export_id = model.id;
                product.created_at = new Date();
                product.updated_at = new Date();
                product.created_by = user;

                delete product.id;
                operations.push(item);
            });
            await ExportDetail.bulkCreate(operations);
        } catch (ex) {
            console.log(`Cannot add products to export detail: ${model.id}`);
            new LogEvent({
                code: ex.code || 500,
                message: `Cannot add products to export detail: ${model.id}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        }
        // TODO: add history
        eventBus.emit(
            new AppEvent(
                {
                    source: 'tbl_exports',
                    event: AppEvent.Events.APP_EVENT_CREATED,
                    message: `${user.id} đã tạo mới phiếu chuyển hàng: ${model.id}`,
                    user: user,
                    data: model
                }
            ).save()
        );
    });

    /**
     * Calculate quantity when export confirmed
     * @param {*} user
     * @param {*} model
     * @param {*} products
     */
    eventBus.on(Export.Events.EXPORT_CONFIRMED, async ({ user, model, products = [] }) => {
        // TODO:: Calculate quantity
        products.map(async el => {
            const itemInventory = await Inventory.findOne({
                where: {
                    item_id: el.id,
                    store_id: model.store.id // chi nhánh nhận hàng
                }
            });
            if (itemInventory) {
                await Inventory.increment(
                    {
                        total_quantity: +el.total_quantity
                    },
                    {
                        where: {
                            item_id: el.id,
                            store_id: model.store.id,
                        }
                    }
                );
            } else {
                await Inventory.create({
                    item_id: el.id,
                    total_quantity: el.total_quantity,
                    store_id: model.store.id,
                    created_by: user
                });
            }
        });

        // TODO: add history
        eventBus.emit(
            new AppEvent(
                {
                    source: 'tbl_exports',
                    event: AppEvent.Events.APP_EVENT_UPDATED,
                    message: `${user.id} đã duyệt phiếu chuyển hàng: ${model.id}`,
                    user: user,
                    data: model
                }
            ).save()
        );
    });

    /**
     * Calculate quantity when export cancelled
     * @param {*} user
     * @param {*} model
     * @param {*} products
     */
    eventBus.on(Export.Events.EXPORT_CANCELLED, async ({ user, model, products = [] }) => {
        // TODO:: Calculate quantity
        products.map(async el => {
            const itemInventory = await Inventory.findOne({
                where: {
                    item_id: el.id,
                    store_id: model.source.id // chi nhánh chuyển hàng
                }
            });
            if (itemInventory) {
                await Inventory.increment(
                    {
                        total_quantity: +el.total_quantity
                    },
                    {
                        where: {
                            item_id: el.id,
                            store_id: model.source.id,
                        }
                    }
                );
            } else {
                await Inventory.create({
                    item_id: el.id,
                    total_quantity: el.total_quantity,
                    store_id: model.source.id,
                    created_by: user
                });
            }
        });

        // TODO: add history
        eventBus.emit(
            new AppEvent(
                {
                    source: 'tbl_exports',
                    event: AppEvent.Events.APP_EVENT_UPDATED,
                    message: `${user.id} đã hủy phiếu chuyển hàng: ${model.id}`,
                    user: user,
                    data: model
                }
            ).save()
        );
    });

    /**
     * Calculate quantity when export returned
     * @param {*} user
     * @param {*} model
     * @param {*} products
     */
    eventBus.on(Export.Events.EXPORT_RETURNED, async ({ user, model, products = [] }) => {
        // TODO:: Calculate quantity
        products.map(async el => {
            const itemInventory = await Inventory.findOne({
                where: {
                    item_id: el.id,
                    store_id: model.source.id
                }
            });
            if (itemInventory) {
                await Inventory.increment(
                    {
                        total_quantity: +el.total_quantity
                    },
                    {
                        where: {
                            item_id: el.id,
                            store_id: model.source.id,
                        }
                    }
                );
            } else {
                await Inventory.create({
                    item_id: el.id,
                    total_quantity: el.total_quantity,
                    store_id: model.source.id,
                    created_by: user
                });
            }
        });

        // TODO: add history
        eventBus.emit(
            new AppEvent(
                {
                    source: 'tbl_exports',
                    event: AppEvent.Events.APP_EVENT_UPDATED,
                    message: `${user.id} đã xác nhận trả hàng của phiếu: ${model.id}`,
                    user: user,
                    data: model
                }
            ).save()
        );
    });
}

function registerImportEvent() {
    /**
     * Add item to export detail when goods recepit create
     *
     * @param {User} user
     * @param {Import} model
     * @param {Item[]} items
     */
    eventBus.on(Import.Events.IMPORT_CREATED, async ({ user, model, items = [] }) => {
        try {
            const operations = [];
            items.forEach(item => {
                const product = item;
                product.item_id = item.id;
                product.import_id = model.id;
                product.created_at = new Date();
                product.updated_at = new Date();
                product.created_by = user;

                delete product.id;
                operations.push(item);
            });

            await ImportDetail.bulkCreate(operations);
        } catch (ex) {
            new LogEvent({
                code: ex.code || 500,
                message: `cannot add item to model: ${model.id}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        } finally {
            new AppEvent({
                source: 'tbl_imports',
                message: `${user.id} đã thêm mới phiếu nhập kho: ${model.id}`,
                event: AppEvent.Events.APP_EVENT_CREATED,
                created_by: user,
                data: model
            }).save();
        }
    });

    /**
     * When model confirmed we will increment quantity to inventory
     * @param {User} user
     * @param {Import} goodIssue
     * @param {Item[]} items
     */
    eventBus.on(Import.Events.IMPORT_CONFIRMED, async ({ user, model, items = [] }) => {
        // TODO:: Calculate quantity
        items.map(async el => {
            const itemInventory = await Inventory.findOne({
                where: {
                    item_id: el.id,
                    store_id: model.store.id
                }
            });
            if (itemInventory) {
                await Inventory.increment(
                    {
                        total_quantity: +el.total_quantity
                    },
                    {
                        where: {
                            item_id: el.id,
                            store_id: model.store.id,
                        }
                    }
                );
            } else {
                await Inventory.create({
                    item_id: el.id,
                    total_quantity: el.total_quantity,
                    store_id: model.store.id,
                    created_by: user
                });
            }
        });

        // TODO: add history
        eventBus.emit(
            new AppEvent(
                {
                    source: 'tbl_imports',
                    event: AppEvent.Events.APP_EVENT_UPDATED,
                    message: `${user.id} đã duyệt phiếu nhập kho: ${model.id}`,
                    user: user,
                    data: model
                }
            ).save()
        );
    });
}

function registerStockTakeEvent() {
    /**
     * Add item to export detail when stock created
     *
     * @param {User} user
     * @param {Stock} stock
     * @param {Item[]} items
     */
    eventBus.on(StockTake.Events.STOCK_CREATED, async ({ user, stock, items = [] }) => {
        try {
            const operations = [];
            items.forEach(item => {
                const product = item;
                product.item_id = item.id;
                product.stock_id = stock.id;
                product.created_at = new Date();
                product.updated_at = new Date();
                product.created_by = user;

                delete product.id;
                operations.push(item);
            });

            await StockTakeDetail.bulkCreate(operations);
        } catch (ex) {
            new LogEvent({
                code: ex.code || 500,
                message: `cannot add item to stock: ${stock.id}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        } finally {
            new AppEvent({
                source: 'imports',
                message: `${user.id} đã thêm mới phiếu kiểm kho: ${stock.id}`,
                event: AppEvent.Events.APP_EVENT_CREATED,
                created_by: user,
                data: stock
            }).save();
        }
    });

    /**
     * When stock take confirmed we will increment quantity to inventory
     *
     * @param {User} user
     * @param {Stock} stock
     * @param {Item[]} items
     */
    eventBus.on(StockTake.Events.STOCK_CONFIRMED, async ({ user, stock, items = [] }) => {
        items.map(async el => {
            const itemInventory = await Inventory.findOne({
                where: {
                    item_id: el.id,
                    store_id: stock.store.id
                }
            });
            if (itemInventory) {
                await Inventory.increment(
                    {
                        total_quantity: el.total_adjustment
                    },
                    {
                        where: {
                            item_id: el.id,
                            store_id: stock.store.id,
                        }
                    }
                );
            } else {
                await Inventory.create({
                    item_id: el.id,
                    total_quantity: el.total_actual,
                    store_id: stock.store.id,
                    created_by: user
                });
            }
        });

        // TODO: add history
        eventBus.emit(
            new AppEvent(
                {
                    source: 'tbl_stocks',
                    event: AppEvent.Events.APP_EVENT_UPDATED,
                    message: `${user.id} đã duyệt phiếu kiểm kho: ${stock.id}`,
                    user: user,
                    data: stock
                }
            ).save()
        );
    });
}


export default {
    registerAppEvent,

    registerProductEvent,

    registerOrderEvent,
    registerDeliveryEvent,

    registerExportEvent,
    registerImportEvent,
    registerStockTakeEvent
};
