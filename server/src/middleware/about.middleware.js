import jwt from "jsonwebtoken";
import { ApiErrorHandler } from "../utils/ApiErrorHandler.js";
import { User } from "../models/user.model.js";

const verifyJwtToken = async(req, res, next)=>{
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if(!token){
        throw new ApiErrorHandler(401, "Unauthroized User")
      } 
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken"
      );
      if(!user){
        throw new ApiErrorHandler(401, "Invalid Access Token");
      }
      console.log("users: ", user);
      req.user = user;
      next();   
    } catch (error) {
        res.status(401).json("Unauthroized User");
    }
}

export default verifyJwtToken;