import { Router } from "express";
import {  logOutUser, refreshAccessToken, userLogin, userRegister } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {aboutGet, aboutPost} from "../controllers/about.controller.js";
import verifyJwtToken from "../middleware/about.middleware.js";

const router = Router();

router.route('/register').post(userRegister);
router.route('/login').post(userLogin);
router.route('/logout').post(verifyJWT,logOutUser);
router.route('/refresh-token').post(refreshAccessToken);

// protected route
router.route('/about').get(verifyJWT, aboutGet);
router.route('/about').post(verifyJwtToken, aboutPost);

export default router;