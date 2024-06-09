import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, deleteOnCloudinaryImg, deleteOnCloudinaryVideo} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    const localPathThumbnail=req.files?.thumbnail[0]?.path;
    const localPathVideo=req.files?.videoFile[0]?.path;
    if(!localPathThumbnail||!localPathVideo){
        throw new ApiError(400,"Video and thumbnail are required")
    }
    const videoFile=await uploadOnCloudinary(localPathVideo)
    const thumbnail=await uploadOnCloudinary(localPathThumbnail)
    if(!videoFile||!thumbnail){
        throw new ApiError(500,"Video and thumbnail uploading failed on server")
    }
    const video=await Video.create({
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        title,
        description,
        duration:videoFile.duration,
        owner:req.user._id
    })
    const isVideoUploaded=await Video.findOne(video._id);
    if(!isVideoUploaded){
        throw new ApiError(500,"Video upload failed")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,video,"video uploaded succesfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Video found successfully")
    )
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description} = req.body
    const localPathThumbnail=req.file?.path;
    const { _id }=req.user;
    const user=await User.findById(_id);
    if(!user){
        throw new ApiError(404,"User not found")
    }
    if(!localPathThumbnail){
        throw new ApiError(400,"Thumbnail is required")
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    const thumbnailToDelete=video.thumbnail;
    await deleteOnCloudinary(thumbnailToDelete);
    const thumbnail=await uploadOnCloudinary(localPathThumbnail)
    if(!thumbnail){
        throw new ApiError(500,"Thumbnail upload failed")
    }
    if(video.owner.toString()!=user._id.toString()){
        throw new ApiError(403,"You are not authorized to update this video")
    }
    // console.log(user._id,video.owner)
    const updatedVideo=await Video.findByIdAndUpdate(videoId,{
        title,
        description,
        thumbnail:thumbnail.url
    },{
        new:true
    }
)
return res
.status(200)
.json(
    new ApiResponse(200,updatedVideo,"Video updated successfully")
)
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { _id }=req.user;
    const user=await User.findById(_id);
    if(!user){
        throw new ApiError(404,"User not found")
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    if(video.owner.toString()!=user._id.toString()){
        throw new ApiError(403,"You are not authorized to delete this video")
    }
    const thumbnailToDelete=video.thumbnail;
    const videoToDelete=video.videoFile;
    const result=await Video.findByIdAndDelete(videoId);
    await deleteOnCloudinaryImg(thumbnailToDelete);   
    await deleteOnCloudinaryVideo(videoToDelete);
    if(!result){
        throw new ApiError(500,"Video deletion failed")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,result,'Video deleted successfully')
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { _id }=req.user;
    try {
        const user=await User.findById(_id);
        if(!user){
            throw new ApiError(404,"User not found")
        }
        const video=await Video.findById(videoId);
        if(!video){
            throw new ApiError(404,"Video not found")
        }
        if(video.owner.toString()!=user._id.toString()){
            throw new ApiError(403,"You are not authorized to update this video")
        }
        const updatedVideo=await Video.findByIdAndUpdate(videoId,{
            isPublished:!video.isPublished
        },{
            new:true
        })
        return res
        .status(200)
        .json(
            new ApiResponse(200,updatedVideo,'Video publish status updated successfully')
        )
    } catch (error) {
        console.log("something went wrong",error)
    }
    
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}