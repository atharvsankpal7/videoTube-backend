import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "uploads",
      use_filename: true,
      unique_filename: true,
    });
    if (!response?.secure_url || !response?.public_id) {
      throw new ApiError(400, "Failed to upload asset to Cloudinary");
    }
    // file has been uploaded successfull
    //console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    const response = await cloudinary.uploader.destroy(publicId);
    if (response.result !== "ok") {
      throw new ApiError(400, "Error Deleting old asset from Cloudinary");
    } 
  } catch (error) {
    throw new ApiError(500, "Error Deleting asset from cloudinary")
  }
};

export { uploadOnCloudinary , deleteFromCloudinary};
