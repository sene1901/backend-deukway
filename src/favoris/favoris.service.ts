import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

const favoriInclude = {
  annonce: {
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      quartier: {
        include: {
          ville: true,
        },
      },
      medias: true,
    },
  },
};

@Injectable()
export class FavorisService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ajouter une annonce aux favoris
   */
  async add(userId: string, annonceId: string) {
    const annonce = await this.prisma.annonce.findUnique({
      where: { id: annonceId },
    });

    if (!annonce) {
      throw new NotFoundException('Annonce introuvable');
    }

    const exists = await this.prisma.favori.findUnique({
      where: {
        userId_annonceId: {
          userId,
          annonceId,
        },
      },
    });

    if (exists) {
      throw new ConflictException(
        'Cette annonce est déjà dans vos favoris',
      );
    }

    return this.prisma.favori.create({
      data: {
        userId,
        annonceId,
      },
      include: favoriInclude,
    });
  }

  /**
   * Retirer une annonce des favoris
   */
  async remove(userId: string, annonceId: string) {
    const favori = await this.prisma.favori.findUnique({
      where: {
        userId_annonceId: {
          userId,
          annonceId,
        },
      },
    });

    if (!favori) {
      throw new NotFoundException(
        "Cette annonce n'est pas dans vos favoris",
      );
    }

    await this.prisma.favori.delete({
      where: {
        userId_annonceId: {
          userId,
          annonceId,
        },
      },
    });

    return {
      success: true,
      message: 'Annonce retirée des favoris',
    };
  }

  /**
   * Liste des favoris de l'utilisateur connecté
   */
  async findAll(userId: string) {
    return this.prisma.favori.findMany({
      where: { userId },
      include: favoriInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Vérifier si une annonce est en favori pour l'utilisateur
   */
  async check(userId: string, annonceId: string) {
    const favori = await this.prisma.favori.findUnique({
      where: {
        userId_annonceId: {
          userId,
          annonceId,
        },
      },
    });

    return { isFavorite: !!favori };
  }
}