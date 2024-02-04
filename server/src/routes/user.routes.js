import { Router } from "express";
import {  logOutUser, refreshAccessToken, userLogin, userRegister } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route('/register').post(userRegister);
router.route('/login').post(userLogin);

// protected routes
router.route('/logout').post(verifyJWT,logOutUser);
router.route('/refresh-token').post(refreshAccessToken);

export default router;