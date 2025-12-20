import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import ApiError from "./apiErr.utils.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Debugging (Optional: Remove after fixing)
console.log(
  "Cloudinary Configured with:",
  process.env.CLOUDINARY_CLOUD_NAME,
  process.env.CLOUDINARY_API_KEY
);

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) throw new Error("File path is required");

    //upload the file to cloudinary

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(filePath);
    return uploadResult;
  } catch (error) {
    fs.unlinkSync(filePath); // Delete the file from local server in case of error
    throw error;
  }
};

const deleteFromCloudinary = async (url) => {
  try {
    if (!url) return null;

    const publicId = extractPublicId(url);

    const res = await cloudinary.uploader.destroy(publicId);
    return res;
  } catch (error) {
    console.log("Error deleting from Cloudinary:", error);
    throw error;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
