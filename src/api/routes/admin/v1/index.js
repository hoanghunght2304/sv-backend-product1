import { Router } from 'express';

import orderRoutes from './order.route';
import orderItemRoutes from './order-item.route';
import deliveryRoutes from './delivery.route';

import storeRoutes from './store.route';
import importsRoutes from './import.route';
import exportRoutes from './export.route';
import stockTakeRoutes from './stock-take.route';

import productRoutes from './product.route';
import priceBookRoutes from './price-book.route';
import productTypeRoutes from './product-type.route';

const router = Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));

router.get('/version/:service', (req, res) => res.send(process.env.GIT_COMMIT_TAG || 'Not available'));

router.use('/orders', orderRoutes);
router.use('/order-items', orderItemRoutes);
router.use('/deliveries', deliveryRoutes);

router.use('/stores', storeRoutes);
router.use('/imports', importsRoutes);
router.use('/exports', exportRoutes);
router.use('/stock-takes', stockTakeRoutes);

router.use('/products', productRoutes);
router.use('/price-books', priceBookRoutes);
router.use('/product-types', productTypeRoutes);

export default router;
