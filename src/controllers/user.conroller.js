import { asynHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken=async(userId)=>{
    try{
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        // console.log(refreshToken,accessToken);
        return {accessToken,refreshToken}
    }catch(error){
        throw new ApiError(500,"Something went wrong while generating access and refresh token")
    }
}

const registerUser= asynHandler(async(req,res)=>{
    // get user details from frontend
    // validation- not empty
    // check if user already exists : username ,email
    //check for images, ceck for avatar
    //upload to cloudinary, avatar
    //create user object - create entry in db
    //remove password and refress token field from response
    // check for user creation
    // return res
    const {fullName,email,username,password}=req.body
    console.log("email: ",email);
    if(
        [fullName,email,username,password].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required")
    }
    const existedUser=await User.findOne({
        $or:[
            { username },{ email }
        ]
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }
    // console.log(req.files);
    const avatarLocalPath=req.files?.avatar[0]?.path;
    // const coverImageLocalPath=req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files&&Array.isArray(req.files.coverImage)&&req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path
    }
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(500,"Avatar upload failed")
    }
    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(201,createdUser,"User registered Successfully")
    )
})
const loginUSer=asynHandler(async(req,res)=>{
    //req body->data
    //username or email
    //find by user
    //password check
    //access and refresh token
    //send cookie
    const {email,username,password}=req.body;
    if(!username&&!email){
        throw new ApiError(400,"Username or email is required")
    }
    // if(!(username||email)){
    //     throw new ApiError(400,"Username or email is required")
    // }
    const user=await User.findOne(
        {
            $or:[
                {username},{email}
            ]
        }
    )
    if(!user){
        throw new ApiError(404,"User not found")
    }

    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid credentials")
    }
    // console.log(user._id);
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
    const loggedInUser=await User.findOne(user._id).select("-password -refreshToken")
    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{
            user:loggedInUser,accessToken,refreshToken
            },
            "User logged in successfully"
        )
    )
})

const logoutUser=asynHandler(async(req,res)=>{
    //get user from req
    //remove refresh token
    //send response
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }

    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out successfully"))
})

const refreshAccessToken=asynHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }
    try {
        const decodedToken=jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRED
        )
        const user=await User.findById(decodedToken?._id);
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
        if(incomingRefreshToken!=user?.refreshAccessToken){
            throw new ApiError(401,"Refresh token is expired or used")
        }
        const {accessToken,newrefreshToken}=await generateAccessAndRefreshToken(user._id)
        const options={
            httpOnly:true,
            secure:true
        }
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(200,{
                accessToken,newrefreshToken
            },"Access token generated successfully")
        )
    } catch (error) {
        throw new ApiError(401,error?.message||"Invalid refresh token")
    }
})

export {
    registerUser,
    loginUSer,
    logoutUser,
    refreshAccessToken
}