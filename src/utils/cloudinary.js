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

const deleteOnCloudinary=async(url)=>{
    try {
        const publicId=url.split("/").pop().split(".")[0];
        if(!publicId){
            console.log("No publicId is available")
            return null
        }
        await cloudinary.uploader.destroy(publicId,{
            resource_type:"auto"
        
        })
        .then((result)=>console.log(result));
    } catch (error) {
        console.log(error.message);
    }
}
export {uploadOnCloudinary,
    deleteOnCloudinary
}