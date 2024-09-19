import express from 'express';
import { createProduct, fetchAllProducts, fetchProductById, fetchProductByVendor, fetchProductsByName, fetchSalesStatByVendor, getTotalOrders, getTotalProductCount, getTotalProfit, resetDatabase, updateProduct } from '../controllers/productController.js';

const productRoutes = express.Router();

productRoutes.route('/create').post(createProduct);
productRoutes.route('/id/:id').get(fetchProductById);
productRoutes.route('/getByVendor/:vendorId').get(fetchProductByVendor);
productRoutes.route('/getAll').get(fetchAllProducts);
productRoutes.route('/update').post(updateProduct);
productRoutes.route('/getTotalCount').get(getTotalProductCount);
productRoutes.route('/getTotalProfit').get(getTotalProfit);
productRoutes.route('/getTotalOrders').get(getTotalOrders);
productRoutes.route('/query/:query').get(fetchProductsByName);
productRoutes.route('/saleStat/:vendor').get(fetchSalesStatByVendor);
productRoutes.route('/resetDb').post(resetDatabase);

export default productRoutes;