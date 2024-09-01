import express from 'express';
import { createAdmin, fetchAllUser, fetchUserById, login } from '../controllers/userController.js';

const userRoutes = express.Router();

userRoutes.route('/createAdmin').post(createAdmin);
userRoutes.route('/login').post(login);
userRoutes.route('/getById/:userId').get(fetchUserById);
userRoutes.route('/getAll').get(fetchAllUser);

export default userRoutes;