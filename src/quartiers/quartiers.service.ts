import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateQuartierDto } from './dto/create-quartier.dto';
import { UpdateQuartierDto } from './dto/update-quartier.dto';

const quartierInclude = {
  ville: true,
};

@Injectable()
export class QuartiersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer un quartier (vérifie que la ville existe)
   */
  async create(dto: CreateQuartierDto) {
    const ville = await this.prisma.ville.findUnique({
      where: { id: dto.villeId },
    });

    if (!ville) {
      throw new NotFoundException('Ville introuvable');
    }

    const exists = await this.prisma.quartier.findFirst({
      where: { name: dto.name, villeId: dto.villeId },
    });

    if (exists) {
      throw new ConflictException(
        'Ce quartier existe déjà dans cette ville',
      );
    }

    return this.prisma.quartier.create({
      data: dto,
      include: quartierInclude,
    });
  }

  /**
   * Liste de tous les quartiers (optionnellement filtrés par ville)
   */
  async findAll(villeId?: string) {
    return this.prisma.quartier.findMany({
      where: villeId ? { villeId } : undefined,
      include: quartierInclude,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Un quartier par son ID
   */
  async findOne(id: string) {
    const quartier = await this.prisma.quartier.findUnique({
      where: { id },
      include: quartierInclude,
    });

    if (!quartier) {
      throw new NotFoundException('Quartier introuvable');
    }

    return quartier;
  }

  /**
   * Modifier un quartier
   */
  async update(id: string, dto: UpdateQuartierDto) {
    await this.findOne(id);

    if (dto.villeId) {
      const ville = await this.prisma.ville.findUnique({
        where: { id: dto.villeId },
      });
      if (!ville) {
        throw new NotFoundException('Ville introuvable');
      }
    }

    return this.prisma.quartier.update({
      where: { id },
      data: dto,
      include: quartierInclude,
    });
  }

  /**
   * Supprimer un quartier
   */
  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.quartier.delete({ where: { id } });

    return {
      success: true,
      message: 'Quartier supprimé avec succès.',
    };
  }
}