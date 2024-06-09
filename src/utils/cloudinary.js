import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadOnCloudinary= async(localFilePath) =>{
    try{
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type:"auto"
        });
        // console.log("File is uploaded on cloudinary",response.url);
        fs.unlinkSync(localFilePath);
        return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath)
        return null
    }
}
const deleteOnCloudinaryImg = async (url) => {
    try {
        // Extract the public ID from the URL
        const urlParts = url.split('/');
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExt.split('.')[0];
        // Check if publicId is available
        if (!publicId) {
            console.log("No publicId is available");
            return null;
        }

        // Perform the deletion
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "image"
        });

        return result;

    } catch (error) {
        console.log(error.message);
    }
};
const deleteOnCloudinaryVideo = async (url) => {
    try {
        // Extract the public ID from the URL
        const urlParts = url.split('/');
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExt.split('.')[0];
        // Check if publicId is available
        if (!publicId) {
            console.log("No publicId is available");
            return null;
        }

        // Perform the deletion
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "video"
        });
        return result;

    } catch (error) {
        console.log(error.message);
    }
};
export {uploadOnCloudinary,
    deleteOnCloudinaryImg,
    deleteOnCloudinaryVideo
}