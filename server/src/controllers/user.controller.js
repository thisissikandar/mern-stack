import { User } from "../models/user.model.js";
import { ApiErrorHandler } from "../utils/ApiErrorHandler.js";
import { ApiResponseHandler } from "../utils/ApiResponseHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

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
  const { fullName, email, password } = req.body;
  // Validation From Fronted
  if ([fullName, email, password].some((fiels) => fiels?.trim() == "")) {
    throw new ApiErrorHandler(400, "All Fields Required");
  }
  // User check From db
  const existedUser = await User.findOne({
    $or: [{ email }],
  });

  if (existedUser) {
    throw new ApiErrorHandler(409, "User Already Exist With This Email");
  }

  // Creating new User to the db
  const user = await User.create({
    fullName,
    email,
    password,
  });

  // for response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiErrorHandler(500, "Something Went Wrong While Register User");
  }
  console.log("created user", createdUser);

  return res
    .status(200)
    .json(
      new ApiResponseHandler(200, createdUser, "User Register Successfully")
    );
});

const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email && !password) {
    throw new ApiErrorHandler("401", "Email And Password Are Required");
  }
  const user = await User.findOne({
    $or: [{ email }],
  });

  if (!user) {
    throw new ApiErrorHandler("404", "User Not exist");
  }

  const isPasswordValid = user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiErrorHandler(401, "Invalid User Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
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
    secure: true,
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


export { userRegister, userLogin, logOutUser, refreshAccessToken };
