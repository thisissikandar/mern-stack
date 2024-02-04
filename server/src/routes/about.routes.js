import { Router } from "express";
import {aboutGet, aboutPost} from "../controllers/about.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const aboutRouter = Router();


// protected routes
aboutRouter.route('/about').get(verifyJWT, aboutGet);
aboutRouter.route('/about').post(verifyJWT,aboutPost);

export default aboutRouter;