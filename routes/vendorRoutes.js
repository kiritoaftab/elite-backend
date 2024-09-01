import express from 'express';
import { createVendor, fetchAllVendors, fetchVendorById, fetchVendorByUserId, updateVendor } from '../controllers/vendorController.js';

const vendorRoutes = express.Router();

vendorRoutes.route("/create").post(createVendor);
vendorRoutes.route("/id/:id").get(fetchVendorById);
vendorRoutes.route("/getByUserId/:userId").get(fetchVendorByUserId);
vendorRoutes.route('/getAll').get(fetchAllVendors);
vendorRoutes.route('/update').post(updateVendor);

export default vendorRoutes;