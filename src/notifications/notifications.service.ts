import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer une notification (utilisé en interne par d'autres services :
   * ex. lors d'une confirmation de visite, d'un nouveau message, etc.)
   */
  async create(userId: string, title: string, body: string) {
    return this.prisma.notification.create({
      data: { userId, title, body },
    });
  }

  /**
   * Liste des notifications de l'utilisateur connecté
   */
  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Nombre de notifications non lues
   */
  async countUnread(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { unreadCount: count };
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification introuvable');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return {
      success: true,
      message: 'Toutes les notifications ont été marquées comme lues',
    };
  }

  /**
   * Supprimer une notification
   */
  async remove(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification introuvable');
    }

    await this.prisma.notification.delete({ where: { id } });

    return {
      success: true,
      message: 'Notification supprimée',
    };
  }
}