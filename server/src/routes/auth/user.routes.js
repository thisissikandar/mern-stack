import { Router } from "express";
import {
  userAssignRoleValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userLoginValidator,
  userRegisterValidator,
} from "../../validators/auth/user.validators.js";
import {
  assignRole,
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  logOutUser,
  refreshAccessToken,
  resendEmailVerification,
  updateUserAvatar,
  userLogin,
  userRegister,
  verifyEmail,
} from "../../controllers/auth/user.controller.js";
import { validate } from "../../validators/validate.js";
import {
  verifyJWT,
  verifyPermission,
} from "../../middleware/auth.middleware.js";
import { UserRolesEnum } from "../../constants.js";
import { upload } from "../../middleware/multer.middleware.js";
import { mongoIdPathVariableValidator } from "../../validators/common/mongodb.validator.js";

const router = Router();

// Unsecured route
router.route("/register").post(userRegisterValidator(), validate, userRegister);
router.route("/login").post(userLoginValidator(), validate, userLogin);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router
  .route("/forgot-password")
  .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);

// protected routes
router.route("/logout").post(verifyJWT, logOutUser);
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router
  .route("/change-password")
  .post(
    verifyJWT,
    userChangeCurrentPasswordValidator(),
    validate,
    changeCurrentPassword
  );
router
  .route("/resend-email-verification")
  .post(verifyJWT, resendEmailVerification);
router
  .route("/assign-role/:userId")
  .post(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    mongoIdPathVariableValidator("userId"),
    userAssignRoleValidator(),
    validate,
    assignRole
  );

export default router;
