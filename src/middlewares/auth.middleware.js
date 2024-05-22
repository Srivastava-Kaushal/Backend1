import { ApiError } from "../utils/ApiError";
import { asynHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT=asynHandler(async(req,_,next)=>{
    try {
        const token=req.cookies?.accessToken||req.header("Authorisation")?.replace("Bearer ","")
        if(!token){
            throw new ApiError(401,"Unauthorized user request")
        }
        const decodedToken=jwt.verify(token,process.env.ACESS_TOKEN_SECRED)
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401,"User not found")
        }
        req.user=user;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message||"Invalid access token")
    }

})