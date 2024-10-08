import cashierRoutes from "./cashierRoutes.js";
import userRoutes from "./userRoutes.js";
import expressRouter from 'express';
import vendorRoutes from "./vendorRoutes.js";
import productRoutes from "./productRoutes.js";
import orderRoutes from "./orderRoutes.js";
import paymentRoutes from "./paymentRoutes.js";

const appRoutes = expressRouter();
appRoutes.use('/user',userRoutes);
appRoutes.use('/cashier',cashierRoutes);
appRoutes.use('/vendor',vendorRoutes);
appRoutes.use('/product',productRoutes);
appRoutes.use('/order',orderRoutes);
appRoutes.use('/payment',paymentRoutes);

export default appRoutes;