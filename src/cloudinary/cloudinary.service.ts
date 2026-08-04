import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'nestjs-uploads' },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed: no result returned from Cloudinary'));
          resolve(result);
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }
}