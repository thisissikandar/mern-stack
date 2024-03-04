import { Router } from "express";
import orderCreation from "../controllers/orderCreation.controller.js";
const orderCreationRoute = Router();

orderCreationRoute.route('/order-creation').get(orderCreation);

export default orderCreationRoute;