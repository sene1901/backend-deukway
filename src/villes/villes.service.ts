import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateVilleDto } from './dto/create-ville.dto';
import { UpdateVilleDto } from './dto/update-ville.dto';

@Injectable()
export class VillesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer une ville
   */
  async create(dto: CreateVilleDto) {
    const exists = await this.prisma.ville.findUnique({
      where: { name: dto.name },
    });

    if (exists) {
      throw new ConflictException('Cette ville existe déjà');
    }

    return this.prisma.ville.create({ data: dto });
  }

  /**
   * Liste de toutes les villes
   */
  async findAll() {
    return this.prisma.ville.findMany({
      include: { quartiers: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Une ville par son ID
   */
  async findOne(id: string) {
    const ville = await this.prisma.ville.findUnique({
      where: { id },
      include: { quartiers: true },
    });

    if (!ville) {
      throw new NotFoundException('Ville introuvable');
    }

    return ville;
  }

  /**
   * Modifier une ville
   */
  async update(id: string, dto: UpdateVilleDto) {
    await this.findOne(id);

    return this.prisma.ville.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Supprimer une ville
   */
  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.ville.delete({ where: { id } });

    return {
      success: true,
      message: 'Ville supprimée avec succès.',
    };
  }
}