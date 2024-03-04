import { Router } from "express";
import { userForgotPasswordValidator, userLoginValidator, userRegisterValidator } from "../../validators/auth/user.validators.js";
import {
  logOutUser,
  refreshAccessToken,
  userLogin,
  userRegister,
  verifyEmail,
} from "../../controllers/auth/user.controller.js";
import { validate } from "../../validators/validate.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";

const router = Router();

// Unsecured route
router.route("/register").post(userRegisterValidator(), validate, userRegister);
router.route("/login").post(userLoginValidator(),validate,userLogin);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router
  .route("/forgot-password")
  .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);


// protected routes
router.route("/logout").post(verifyJWT, logOutUser);

export default router;
