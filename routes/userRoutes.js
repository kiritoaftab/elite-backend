import express from 'express';
import { createAdmin } from '../controllers/userController.js';

const userRoutes = express.Router();

userRoutes.route('/createAdmin').post(createAdmin);

export default userRoutes;