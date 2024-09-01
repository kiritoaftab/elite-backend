import express from 'express';
import { createProduct, fetchAllProducts, fetchProductById, fetchProductByVendor, updateProduct } from '../controllers/productController.js';

const productRoutes = express.Router();

productRoutes.route('/create').post(createProduct);
productRoutes.route('/id/:id').get(fetchProductById);
productRoutes.route('/getByVendor/:vendorId').get(fetchProductByVendor);
productRoutes.route('/getAll').get(fetchAllProducts);
productRoutes.route('/update').post(updateProduct);


export default productRoutes;