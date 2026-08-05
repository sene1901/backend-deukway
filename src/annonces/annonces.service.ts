import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
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
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer une annonce
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
   * Liste de toutes les annonces (filtrable par ville et/ou quartier)
   */
  async findAll(filters?: { villeId?: string; quartierId?: string }) {
    return this.prisma.annonce.findMany({
      where: {
        ...(filters?.quartierId && { quartierId: filters.quartierId }),
        ...(filters?.villeId && {
          quartier: { villeId: filters.villeId },
        }),
      },
      include: annonceInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Une annonce par son ID
   */
  async findOne(id: string) {
    const annonce = await this.prisma.annonce.findUnique({
      where: {
        id,
      },
      include: annonceInclude,
    });

    if (!annonce) {
      throw new NotFoundException('Annonce introuvable');
    }

    return annonce;
  }

  /**
   * Modifier une annonce
   */
  async update(
    id: string,
    ownerId: string,
    dto: UpdateAnnonceDto,
  ) {
    const annonce = await this.prisma.annonce.findUnique({
      where: { id },
    });

    if (!annonce) {
      throw new NotFoundException('Annonce introuvable');
    }

    if (annonce.ownerId !== ownerId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres annonces.',
      );
    }

    return this.prisma.annonce.update({
      where: {
        id,
      },
      data: dto,
      include: annonceInclude,
    });
  }

  /**
   * Supprimer une annonce
   */
  async remove(id: string, ownerId: string) {
    const annonce = await this.prisma.annonce.findUnique({
      where: { id },
    });

    if (!annonce) {
      throw new NotFoundException('Annonce introuvable');
    }

    if (annonce.ownerId !== ownerId) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que vos propres annonces.',
      );
    }

    await this.prisma.annonce.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message: 'Annonce supprimée avec succès.',
    };
  }
}