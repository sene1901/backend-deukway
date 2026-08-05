import { Inject, Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 } from 'cloudinary';
import * as streamifier from 'streamifier';

import { CLOUDINARY } from './cloudinary.provider';

@Injectable()
export class CloudinaryService {
  constructor(@Inject(CLOUDINARY) private readonly cloudinary: typeof v2) {}

  uploadFile(
    file: Express.Multer.File,
    resourceType: 'image' | 'video' = 'image',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: 'deukway/annonces',
          resource_type: resourceType,
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              error ?? new Error("Échec de l'upload Cloudinary"),
            );
          }
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFile(
    publicId: string,
    resourceType: 'image' | 'video' = 'image',
  ) {
    return this.cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  }
}