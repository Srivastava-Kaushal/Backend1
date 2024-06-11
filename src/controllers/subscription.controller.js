import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { response } from "express"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const subscriberId= req.user?._id 
    if(!subscriberId){
        throw new ApiError(401,"Unauthorized")
    }
    try {
        const isSubscribed=Subscription.findOne({channel:channelId,subscriber:subscriberId});
        let response;
        if(isSubscribed){
            response=await Subscription.deleteOne({channel:channelId,subscriber:subscriberId});
        }
        else{
            response=await Subscription.create({channel:channelId,subscriber:subscriberId});
        }
        if(!response){
            throw new ApiError(500,"Something went wrong while toggling subscription")
        }
        return res.status(200).json(new ApiResponse(200,response,"Subscription toggled successfully"))
    } catch (error) {
        throw new ApiError(501,"subscription failed",error.message)
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!subscriberId){
        throw new ApiError(401,"Unauthorized")
    }

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}