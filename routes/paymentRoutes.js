import express from 'express';
import { fetchAllPayments, fetchPaymentById, fetchPaymentsByIds, updatePayment, updatePaymentsList } from '../controllers/paymentsController.js';

const paymentRoutes = express.Router();

paymentRoutes.route('/update').post(updatePayment);
paymentRoutes.route('/updateMany').post(updatePaymentsList);
paymentRoutes.route('/id/:id').get(fetchPaymentById);
paymentRoutes.route('/list').post(fetchPaymentsByIds);
paymentRoutes.route('/getAll').get(fetchAllPayments);


export default paymentRoutes;