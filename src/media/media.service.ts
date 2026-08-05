import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MediaType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Uploader un média (photo, vidéo, visite virtuelle) sur une annonce
   */
  async upload(
    annonceId: string,
    ownerId: string,
    file: Express.Multer.File,
    type: MediaType,
  ) {
    const annonce = await this.prisma.annonce.findUnique({
      where: { id: annonceId },
    });

    if (!annonce) {
      throw new NotFoundException('Annonce introuvable');
    }

    if (annonce.ownerId !== ownerId) {
      throw new ForbiddenException(
        'Vous ne pouvez ajouter des médias qu\'à vos propres annonces',
      );
    }

    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const resourceType = type === 'IMAGE' ? 'image' : 'video';

    const result = await this.cloudinaryService.uploadFile(
      file,
      resourceType,
    );

    return this.prisma.media.create({
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        type,
        annonceId,
      },
    });
  }

  /**
   * Liste des médias d'une annonce
   */
  async findByAnnonce(annonceId: string) {
    return this.prisma.media.findMany({
      where: { annonceId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Supprimer un média
   */
  async remove(mediaId: string, ownerId: string) {
    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
      include: { annonce: true },
    });

    if (!media) {
      throw new NotFoundException('Média introuvable');
    }

    if (media.annonce.ownerId !== ownerId) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que les médias de vos propres annonces',
      );
    }

    if (media.publicId) {
      const resourceType = media.type === 'IMAGE' ? 'image' : 'video';
      await this.cloudinaryService.deleteFile(media.publicId, resourceType);
    }

    await this.prisma.media.delete({ where: { id: mediaId } });

    return {
      success: true,
      message: 'Média supprimé avec succès',
    };
  }
}