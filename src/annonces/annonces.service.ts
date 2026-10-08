import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateAnnonceDto } from './dto/create-annonce.dto';
import { UpdateAnnonceDto } from './dto/update-annonce.dto';

const annonceInclude = {
  owner: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      city: true,
      avatar: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
  },
  quartier: {
    include: {
      ville: true,
    },
  },
  medias: true,
};

@Injectable()
export class AnnoncesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Créer une annonce.
   */
  async create(ownerId: string, dto: CreateAnnonceDto) {
    return this.prisma.annonce.create({
      data: {
        ...dto,
        ownerId,
      },
      include: annonceInclude,
    });
  }

  /**
   * Créer une annonce avec ses images.
   */
  async createWithMedia(
    ownerId: string,
    dto: CreateAnnonceDto,
    files: Express.Multer.File[],
  ) {
    const annonce = await this.prisma.annonce.create({
      data: {
        ...dto,
        ownerId,
      },
    });

    if (files?.length) {
      await Promise.all(
        files.map(async (file) => {
          const result = await this.cloudinaryService.uploadFile(
            file,
            'image',
          );

          return this.prisma.media.create({
            data: {
              url: result.secure_url,
              publicId: result.public_id,
              type: 'IMAGE',
              annonceId: annonce.id,
            },
          });
        }),
      );
    }

    return this.findOne(annonce.id);
  }

  /**
   * Liste des annonces filtrable par ville et quartier.
   */
  async findAll(filters?: {
    villeId?: string;
    quartierId?: string;
  }) {
    return this.prisma.annonce.findMany({
      where: {
        ...(filters?.quartierId && {
          quartierId: filters.quartierId,
        }),
        ...(filters?.villeId && {
          quartier: {
            villeId: filters.villeId,
          },
        }),
      },
      include: annonceInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Consulter une annonce.
   */
  async findOne(id: string) {
    const annonce = await this.prisma.annonce.findUnique({
      where: { id },
      include: annonceInclude,
    });

    if (!annonce) {
      throw new NotFoundException('Annonce introuvable');
    }

    return annonce;
  }

  /**
   * Annonces similaires : même type, prix proche,
   * même quartier ou même ville.
   */
  async findSimilar(id: string, limit = 6) {
    const annonce = await this.prisma.annonce.findUnique({
      where: { id },
      include: { quartier: true },
    });

    if (!annonce) {
      throw new NotFoundException('Annonce introuvable');
    }

    const minPrice = annonce.price * 0.8;
    const maxPrice = annonce.price * 1.2;

    let similar = await this.prisma.annonce.findMany({
      where: {
        id: { not: id },
        propertyType: annonce.propertyType,
        price: { gte: minPrice, lte: maxPrice },
        quartierId: annonce.quartierId ?? undefined,
        status: 'AVAILABLE',
      },
      include: annonceInclude,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    if (similar.length < limit && annonce.quartier?.villeId) {
      const existingIds = similar.map((item) => item.id);

      const additional = await this.prisma.annonce.findMany({
        where: {
          id: { notIn: [...existingIds, id] },
          propertyType: annonce.propertyType,
          price: { gte: minPrice, lte: maxPrice },
          quartier: {
            villeId: annonce.quartier.villeId,
          },
          status: 'AVAILABLE',
        },
        include: annonceInclude,
        take: limit - similar.length,
        orderBy: { createdAt: 'desc' },
      });

      similar = [...similar, ...additional];
    }

    return similar;
  }

  /**
   * Modifier une annonce.
   * Un propriétaire peut modifier uniquement ses annonces.
   * Un administrateur peut modifier toutes les annonces.
   */
  async update(
    id: string,
    userId: string,
    dto: UpdateAnnonceDto,
    role: UserRole = UserRole.OWNER,
  ) {
    const annonce = await this.prisma.annonce.findUnique({
      where: { id },
    });

    if (!annonce) {
      throw new NotFoundException('Annonce introuvable');
    }

    if (
      role !== UserRole.ADMIN &&
      annonce.ownerId !== userId
    ) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres annonces.',
      );
    }

    return this.prisma.annonce.update({
      where: { id },
      data: dto,
      include: annonceInclude,
    });
  }

  /**
   * Supprimer une annonce.
   * Un propriétaire peut supprimer uniquement ses annonces.
   * Un administrateur peut supprimer toutes les annonces.
   */
  async remove(
    id: string,
    userId: string,
    role: UserRole = UserRole.OWNER,
  ) {
    const annonce = await this.prisma.annonce.findUnique({
      where: { id },
    });

    if (!annonce) {
      throw new NotFoundException('Annonce introuvable');
    }

    if (
      role !== UserRole.ADMIN &&
      annonce.ownerId !== userId
    ) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que vos propres annonces.',
      );
    }

    await this.prisma.annonce.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Annonce supprimée avec succès.',
    };
  }
}
