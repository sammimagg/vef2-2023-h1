import { NextFunction, Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { findById } from "../lib/users.js";
import { putProfilePicture } from "../lib/db.js";

dotenv.config();
// Configuration
cloudinary.config({
  cloud_name: "dxjolxcx7",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRIT,
  secure: true,
});

export async function uploadImage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;
  const user = await findById(parseInt(id));
  let profileUrl: string;
  try {
    // Upload the image to Cloudinary
    if (!user) {
      return res.status(400).json({ error: "No user with that id" });
    }
    if (!req.files || !req.files.images) {
      return res.status(400).json({ error: "No image provided" });
    }
    const file = req.files.images;
    const resultCloudinary = await cloudinary.uploader.upload(
      Array.isArray(file) ? file[0].tempFilePath : file.tempFilePath,
      {
        public_id: `${Date.now()}`,
        resource_type: "auto",
        folder: "images",
        allowed_formats: ["jpg", "png"],
      }
    );
    profileUrl = resultCloudinary.url;
    const result = await putProfilePicture(parseInt(id), profileUrl);

    // Return the URL of the uploaded image
    res.json(result);
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ error: "Image upload failed" });
  }
}
