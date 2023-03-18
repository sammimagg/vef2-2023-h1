import { NextFunction, Request, Response } from 'express';
import cloudinary from 'cloudinary';

export async function uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      // Upload the image to Cloudinary
      //const result = await cloudinary.v2.uploader.upload(req.file.path);
  
  
      // Return the URL of the uploaded image
    // res.json({ url: result.secure_url });
    } catch (error) {
      // Handle errors
      console.error(error);
      res.status(500).json({ error: 'Image upload failed' });
    }
  }