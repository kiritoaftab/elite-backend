import express from 'express';
import { createVendor, fetchAllVendors, fetchVendorById, fetchVendorByUserId, getTotalSales, getTotalVendorCount, updateVendor } from '../controllers/vendorController.js';

const vendorRoutes = express.Router();

vendorRoutes.route("/create").post(createVendor);
vendorRoutes.route("/id/:id").get(fetchVendorById);
vendorRoutes.route("/getByUserId/:userId").get(fetchVendorByUserId);
vendorRoutes.route('/getAll').get(fetchAllVendors);
vendorRoutes.route('/update').post(updateVendor);
vendorRoutes.route('/getTotalCount').get(getTotalVendorCount);
vendorRoutes.route('/getTotalSales').get(getTotalSales);

export default vendorRoutes;