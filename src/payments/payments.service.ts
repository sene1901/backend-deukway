import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Simule un appel à l'API du provider de paiement.
   *  À remplacer plus tard par les vrais appels Wave / Orange Money / Free Money / Carte.
   */
  private async callProviderApi(
    provider: string,
    amount: number,
  ): Promise<{ success: boolean; reference: string }> {
    // Simule une référence de transaction
    const reference = `${provider}-${Date.now()}-${Math.floor(
      Math.random() * 10000,
    )}`;

    // Simule un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 300));

    // En mock, on simule toujours un succès
    return { success: true, reference };
  }

  /**
   * Initier un paiement
   */
  async initiate(userId: string, dto: CreatePaymentDto) {
    // Crée le paiement en attente
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount: dto.amount,
        provider: dto.provider,
        type: dto.type,
        annonceId: dto.annonceId,
        reservationId: dto.reservationId,
        status: 'PENDING',
        reference: `TEMP-${Date.now()}`, // remplacé juste après
      },
    });

    // Appelle le provider (mocké)
    const result = await this.callProviderApi(dto.provider, dto.amount);

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: result.success ? 'SUCCESS' : 'FAILED',
        reference: result.reference,
      },
    });

    await this.notificationsService.create(
      userId,
      result.success ? 'Paiement réussi' : 'Paiement échoué',
      result.success
        ? `Votre paiement de ${dto.amount} FCFA via ${dto.provider} a été effectué avec succès.`
        : `Votre paiement de ${dto.amount} FCFA via ${dto.provider} a échoué.`,
    );

    return updated;
  }

  /**
   * Mes paiements
   */
  async findMine(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      include: {
        annonce: { select: { id: true, title: true } },
        reservation: { select: { id: true, date: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Un paiement précis
   */
  async findOne(id: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        annonce: { select: { id: true, title: true } },
        reservation: { select: { id: true, date: true } },
      },
    });

    if (!payment || payment.userId !== userId) {
      throw new NotFoundException('Paiement introuvable');
    }

    return payment;
  }

  /**
   * Toutes les transactions (admin — suivi des paiements/commissions)
   */
  async findAll() {
    return this.prisma.payment.findMany({
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
        annonce: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}