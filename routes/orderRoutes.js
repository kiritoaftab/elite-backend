import express from 'express';
import { createOrder, createOrderV2, fetchAllOrders, fetchOrderByCashier, fetchOrderById, fetchOrderByProduct, fetchOrderByVendor } from '../controllers/orderController.js';


const orderRoutes = express.Router();

orderRoutes.route('/create').post(createOrder);
orderRoutes.route('/create/v2').post(createOrderV2);
orderRoutes.route('/id/:id').get(fetchOrderById);
orderRoutes.route('/getByVendor/:vendorId').get(fetchOrderByVendor);
orderRoutes.route('/getByCashier/:cashierId').get(fetchOrderByCashier);
orderRoutes.route('/getByProduct/:productId').get(fetchOrderByProduct);
orderRoutes.route('/getAll').get(fetchAllOrders);

export default orderRoutes;