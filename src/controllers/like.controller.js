import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    try {
        const {videoId} = req.params
        const {userId} = req.user
        const video=await Video.findById(videoId);
        if(!video){
            throw new ApiError(404,"Video not found")
        }
        const like = await Like.findOne({video:videoId,owner:userId})
        if(!like){
            const result=await Like.create({video:videoId,owner:userId})
            return res
            .status(200)
            .json(new ApiResponse(200,result,"Liked video"))
        }
        else{
            const result=await Like.findOneAndDelete({video:videoId,owner:userId})
            return res
            .status(200)
            .json(new ApiResponse(200,result,"Unliked video"))
        }
    } catch (error) {
        throw new ApiError(500,error.message);
    }
    //TODO: toggle like on video
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    try {
        const {commentId} = req.params
        const {userId} = req.user
        const comment=await Comment.findById(commentId);
        if(!comment){
            throw new ApiError(404,"Comment not found")
        }
        const like = await Like.findOne({comment:commentId,owner:userId})
        if(!like){
            const result=await Like.create({comment:commentId,owner:userId})
            return res
            .status(200)
            .json(new ApiResponse(200,result,"Liked comment"))
        }
        else{
            const result=await Like.findOneAndDelete({comment:commentId,owner:userId})
            return res
            .status(200)
            .json(new ApiResponse(200,result,"Unliked comment"))
        }
    } catch (error) {
        throw new ApiError(505,error.message);
    }

    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    try {
        const {tweetId} = req.params
        const {userId} = req.user
        const tweet= await Tweet.findById(tweetId);
        if(!tweet){
            throw new ApiError(404,"Tweet not found")
        }
        const like = await Like.findOne({tweet:tweetId,owner:userId})
        if(!like){
            const result=await Like.create({tweet:tweetId,owner:userId})
            return res
            .status(200)
            .json(new ApiResponse(200,result,"Liked tweet"))
        }
        else{
            const result=await Like.findOneAndDelete({tweet:tweetId,owner:userId})
            return res
            .status(200)
            .json(new ApiResponse(200,result,"Unliked tweet"))
        }
    } catch (error) {
        throw new ApiError(506,error.message);
    }

    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}