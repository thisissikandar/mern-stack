import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrorHandler } from "../utils/ApiErrorHandler.js";
import { User } from "../models/auth/user.model.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiErrorHandler(401, "Unauthorized request");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

    if (!user) {
      /**
       *  Client should make a request to /api/v1/users/refresh-token if
       * they have refreshToken present in their cookie
       *
       * Then they will get a new access token which will allow them to
       *  refresh the access token without logging out the user
       */

      throw new ApiErrorHandler(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiErrorHandler(401, error?.message || "Invalid access token");
  }
});
export { verifyJWT };
