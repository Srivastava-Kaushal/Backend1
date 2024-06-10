import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    try {
        const {videoId} = req.params
        const {text} = req.body
        if(!text){
            throw new ApiError(400,"Comment text is required")
        }
        const comment = await Comment.create({
            content:text,
            video: videoId,
            owner: req.user._id
        })
        return res
        .status(201)
        .json(
            new ApiResponse(201,comment,"Comment added successfully")
        )
    } catch (error) {
        console.log("Something went wrong while adding comment ",error)
    }
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    try {
        const {updatedComment}=req.body;
        const {commentId}=req.params;
        const userId=req.user._id;
        const oldcomment=await Comment.findById(commentId);
        if(!oldcomment){
            throw new ApiError(404,"Comment not found")
        }
        if(oldcomment.owner.toString()!==userId.toString()){
            throw new ApiError(403,"You are not allowed to update this comment")
        }
        if(!updatedComment){
            throw new ApiError(400,"Comment text is required")
        }
        const comment=await Comment.findByIdAndUpdate(
            commentId,
            {content:updatedComment},
            {new:true}
        )
        if(!comment){
            throw new ApiError(404,"Comment not found")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200,comment,"Comment updated successfully")
        )
    } catch (error) {
        console.log("Something went wrong while updating the comment", error);
    }
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    try {
        const {commentId}=req.params;
        const userId=req.user._id;
        const comment= await Comment.findById(commentId);
        if(!comment){
            throw new ApiError(404,"Comment not found")
        }
        if(comment.owner.toString()!==userId.toString()){
            throw new ApiError(403,"You are not allowed to delete this comment")
        }
        const result=await Comment.findByIdAndDelete(commentId);
        if(!result){
            throw new ApiError(500,"Comment deletion failed")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200,result,"Comment deleted successfully")
        )
    } catch (error) {
        console.log("Something went wrong while deleting the comment ",error);
    }
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }