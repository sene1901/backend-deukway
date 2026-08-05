import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { ContractsService } from '../contracts/contracts.service';

const reservationInclude = {
  tenant: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
    },
  },
  annonce: {
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
    },
  },
};

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly contractsService: ContractsService,
  ) {}

  /**
   * Créer une demande de visite (côté locataire)
   */
  async create(tenantId: string, dto: CreateReservationDto) {
    const annonce = await this.prisma.annonce.findUnique({
      where: { id: dto.annonceId },
    });

    if (!annonce) {
      throw new NotFoundException('Annonce introuvable');
    }

    if (annonce.ownerId === tenantId) {
      throw new BadRequestException(
        'Vous ne pouvez pas réserver une visite pour votre propre annonce',
      );
    }

    const reservation = await this.prisma.reservation.create({
      data: {
        tenantId,
        annonceId: dto.annonceId,
        date: new Date(dto.date),
        message: dto.message,
      },
      include: reservationInclude,
    });

    // Notifie le propriétaire qu'il a reçu une nouvelle demande de visite
    await this.notificationsService.create(
      annonce.ownerId,
      'Nouvelle demande de visite',
      `Vous avez reçu une demande de visite pour "${annonce.title}".`,
    );

    return reservation;
  }

  /**
   * Réservations faites par l'utilisateur connecté (locataire)
   */
  async findMine(tenantId: string) {
    return this.prisma.reservation.findMany({
      where: { tenantId },
      include: reservationInclude,
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Réservations reçues sur les annonces de l'utilisateur connecté (propriétaire)
   */
  async findReceived(ownerId: string) {
    return this.prisma.reservation.findMany({
      where: {
        annonce: { ownerId },
      },
      include: reservationInclude,
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Confirmer ou rejeter une réservation (côté propriétaire)
   */
  async updateStatus(
    id: string,
    ownerId: string,
    dto: UpdateReservationStatusDto,
  ) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { annonce: true },
    });

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable');
    }

    if (reservation.annonce.ownerId !== ownerId) {
      throw new ForbiddenException(
        "Vous ne pouvez gérer que les réservations de vos propres annonces",
      );
    }

    if (dto.status === 'PENDING') {
      throw new BadRequestException(
        'Impossible de repasser une réservation en attente',
      );
    }

    const updated = await this.prisma.reservation.update({
      where: { id },
      data: { status: dto.status },
      include: reservationInclude,
    });

    // Notifie le locataire de la décision du propriétaire
    await this.notificationsService.create(
      reservation.tenantId,
      dto.status === 'CONFIRMED' ? 'Visite confirmée' : 'Visite rejetée',
      dto.status === 'CONFIRMED'
        ? `Votre demande de visite pour "${reservation.annonce.title}" a été confirmée.`
        : `Votre demande de visite pour "${reservation.annonce.title}" a été rejetée.`,
    );

    return updated;
  }

  /**
   * Annuler sa propre réservation (côté locataire)
   */
  async cancel(id: string, tenantId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { annonce: true },
    });

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable');
    }

    if (reservation.tenantId !== tenantId) {
      throw new ForbiddenException(
        'Vous ne pouvez annuler que vos propres réservations',
      );
    }

    if (reservation.status !== 'PENDING' && reservation.status !== 'CONFIRMED') {
      throw new BadRequestException(
        'Cette réservation ne peut plus être annulée',
      );
    }

    const updated = await this.prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: reservationInclude,
    });

    // Notifie le propriétaire de l'annulation
    await this.notificationsService.create(
      reservation.annonce.ownerId,
      'Visite annulée',
      `La visite prévue pour "${reservation.annonce.title}" a été annulée par le locataire.`,
    );

    return updated;
  }
}