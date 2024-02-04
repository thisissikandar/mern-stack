import { AboutModel } from "../models/about.model.js";
import { ApiResponseHandler } from "../utils/ApiResponseHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const aboutPost = asyncHandler(async (req, res, next) => {
  const result = await AboutModel.create(req.body);
  const response = await result.save();
  res.send(response);
});

// about get
const aboutGet = asyncHandler(async (req, res, next) => {
  const getAbout = await AboutModel.findOne();

  return res
    .status(200)
    .json(new ApiResponseHandler(200, {getAbout}, "data get successfully"));
});

export { aboutGet, aboutPost };
