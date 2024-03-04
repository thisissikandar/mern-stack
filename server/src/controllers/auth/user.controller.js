import jwt from "jsonwebtoken";
import { User } from "../../models/auth/user.model.js";
import { ApiErrorHandler } from "../../utils/ApiErrorHandler.js";
import { UserLoginType, UserRolesEnum } from "../../constants.js";
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../../utils/mail.js";
import { ApiResponseHandler } from "../../utils/ApiResponseHandler.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // attach refresh token to the user document to avoid refreshing the access token with multiple refresh tokens
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: true });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiErrorHandler(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const userRegister = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiErrorHandler(
      409,
      "User with email or username already exists",
      []
    );
  }

  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
    role: role || UserRolesEnum.USER,
  });

  /**
   * unHashedToken: unHashed token is something we will send to the user's mail
   * hashedToken: we will keep record of hashedToken to validate the unHashedToken in verify email controller
   * tokenExpiry: Expiry to be checked before validating the incoming token
   */

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  /**
   * assign hashedToken and tokenExpiry in DB till user clicks on email verification link
   * The email verification is handled by {@link verifyEmail}
   */

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/verify-email/${unHashedToken}`
    ),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );
  if (!createdUser) {
    throw new ApiErrorHandler(500, "Something went wrong while registering the user");
  }

  return res
  .status(201)
  .json(
    new ApiResponseHandler(
      200,
      { user: createdUser },
      "Users registered successfully and verification email has been sent on your email."
    )
  );
});

const userLogin = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiErrorHandler(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });


  if (!user) {
    throw new ApiErrorHandler("404", "User Not exist");
  }

  if (user.loginType !== UserLoginType.EMAIL_PASSWORD) {
    // If user is registered with some other method, we will ask him/her to use the same method as registered.
    // This shows that if user is registered with methods other than email password, he/she will not be able to login with password. Which makes password field redundant for the SSO
    throw new ApiErrorHandler(
      400,
      "You have previously registered using " +
        user.loginType?.toLowerCase() +
        ". Please use the " +
        user.loginType?.toLowerCase() +
        " login option to access your account."
    );
  }
  const isPasswordValid = user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiErrorHandler(401, "Invalid User Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // get the user document ignoring the password and refreshToken field
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

   // TODO: Add more options to make cookie more secure and reliable
   const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponseHandler(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Login Successfully"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponseHandler(200, {}, "User logged Out"));
});

// refresh token request route for frontend
const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incommingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incommingRefreshToken) {
      throw new ApiErrorHandler(401, "Unauthorize request");
    }
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOCKEN_SECRET
    );
    console.log("user: ", decodedToken);
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiErrorHandler("401", "Invalid Refresh Token");
    }

    if (incommingRefreshToken !== user?.refreshToken) {
      throw new ApiErrorHandler(
        401,
        "Refresh Token has been already Used or expired"
      );
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user?._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponseHandler(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "accessed Refresh Token"
        )
      );
  } catch (error) {
    throw new ApiErrorHandler(401, error?.message || "Invalid Refresh Token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiErrorHandler(400, "Invalid Old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: true });

  return res
    .status(200)
    .json(new ApiResponseHandler(200, {}, "Password is updated"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponseHandler(200, req.user, "Current user Fetch Successfully")
    );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName && !email) {
    throw new ApiErrorHandler(400, "All Fields Are Required");
  }

  //  If its third parameter new its return All the updated
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: [{ fullName, email }] },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponseHandler(201, user, "Accounr Details Updated Successfully")
    );
});


const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    throw new ApiErrorHandler(400, "Email verification token is missing");
  }

  // generate a hash from the token that we are receiving
  let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  // While registering the user, same time when we are sending the verification mail
  // we have saved a hashed value of the original email verification token in the db
  // We will try to find user with the hashed token generated by received token
  // If we find the user another check is if token expiry of that token is greater than current time if not that means it is expired
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiErrorHandler(489, "Token is invalid or expired");
  }

  // If we found the user that means the token is valid
  // Now we can remove the associated email token and expiry date as we no  longer need them
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  // Tun the email verified flag to `true`
  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponseHandler(200, { isEmailVerified: true }, "Email is verified"));
});

// This controller is called when user is logged in and he has snackbar that your email is not verified
// In case he did not get the email or the email verification token is expired
// he will be able to resend the token while he is logged in
const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiErrorHandler(404, "User does not exists", []);
  }

  // if email is already verified throw an error
  if (user.isEmailVerified) {
    throw new ApiErrorHandler(409, "Email is already verified!");
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken(); // generate email verification creds

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/verify-email/${unHashedToken}`
    ),
  });
  return res
    .status(200)
    .json(new ApiResponseHandler(200, {}, "Mail has been sent to your mail ID"));
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Get email from the client and check if user exists
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiErrorHandler(404, "User does not exists", []);
  }

  // Generate a temporary token
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken(); // generate password reset creds

  // save the hashed version a of the token and expiry in the DB
  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  // Send mail with the password reset link. It should be the link of the frontend url with token
  await sendEmail({
    email: user?.email,
    subject: "Password reset request",
    mailgenContent: forgotPasswordMailgenContent(
      user.username,
      // ! NOTE: Following link should be the link of the frontend page responsible to request password reset
      // ! Frontend will send the below token with the new password in the request body to the backend reset password endpoint
      // * Ideally take the url from the .env file which should be teh url of the frontend
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/reset-password/${unHashedToken}`
    ),
  });
  return res
    .status(200)
    .json(
      new ApiResponseHandler(
        200,
        {},
        "Password reset mail has been sent on your mail id"
      )
    );
});
export {
  userRegister,
  userLogin,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  verifyEmail,
  resendEmailVerification,
  forgotPasswordRequest,
};
