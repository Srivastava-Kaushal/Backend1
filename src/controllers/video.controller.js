import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
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
        throw new ApiError(500,"Video and uploading failed on server")
    }
    const video=await Video.create({
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        title,
        description,
        durration:videoFile.durration,
        owner:req.user._id
    })
    const isVideoUploaded=Video.findOne(video._id);
    if(!isVideoUploaded){
        throw new ApiError(500,"Video upload failed")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,video,"video uploaded succesfully"))
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}