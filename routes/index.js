import userRoutes from "./userRoutes.js";
import expressRouter from 'express';

const appRoutes = expressRouter();
appRoutes.use('/user',userRoutes);

export default appRoutes;