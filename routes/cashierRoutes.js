import express from 'express';
import { createCashier, deleteCashier, fetchAllCashier, fetchCashierById, fetchCashierByUserId, getTotalCashierCount, updateCashier } from '../controllers/cashierController.js';

const cashierRoutes = express.Router();

cashierRoutes.route("/create").post(createCashier);
cashierRoutes.route('/id/:id').get(fetchCashierById);
cashierRoutes.route('/getByUserId/:userId').get(fetchCashierByUserId);
cashierRoutes.route('/getAll').get(fetchAllCashier);
cashierRoutes.route('/update').post(updateCashier);
cashierRoutes.route('/delete/:id').delete(deleteCashier);
cashierRoutes.route('/getTotal').get(getTotalCashierCount);

export default cashierRoutes;