import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { extractPublicId } from "cloudinary-build-url";
import ApiError from "./apiErr.utils";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) throw new ApiError("File path is required");

    const uploadRes = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    fs.unlink(filePath);
    return uploadRes;
  } catch (error) {
    fs.unlink(filePath);
    throw error;
  }
};
