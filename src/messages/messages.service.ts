import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

const userSummary = {
  select: {
    id: true,
    firstName: true,
    lastName: true,
    avatar: true,
  },
};

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Envoyer un message
   */
  async send(senderId: string, dto: CreateMessageDto) {
    const receiver = await this.prisma.user.findUnique({
      where: { id: dto.receiverId },
    });

    if (!receiver) {
      throw new NotFoundException('Destinataire introuvable');
    }

    return this.prisma.message.create({
      data: {
        senderId,
        receiverId: dto.receiverId,
        content: dto.content,
        annonceId: dto.annonceId,
      },
      include: {
        sender: userSummary,
        receiver: userSummary,
      },
    });
  }

  /**
   * Liste des conversations de l'utilisateur (dernier message par interlocuteur)
   */
  async findConversations(userId: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: userSummary,
        receiver: userSummary,
        annonce: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const conversationsMap = new Map<string, any>();

    for (const message of messages) {
      const otherUserId =
        message.senderId === userId
          ? message.receiverId
          : message.senderId;

      const key = `${otherUserId}-${message.annonceId ?? 'general'}`;

      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          otherUser:
            message.senderId === userId
              ? message.receiver
              : message.sender,
          annonce: message.annonce,
          lastMessage: message,
        });
      }
    }

    return Array.from(conversationsMap.values());
  }

  /**
   * Messages échangés avec un utilisateur précis (optionnellement liés à une annonce)
   */
  async findConversation(
    userId: string,
    otherUserId: string,
    annonceId?: string,
  ) {
    const messages = await this.prisma.message.findMany({
      where: {
        AND: [
          {
            OR: [
              { senderId: userId, receiverId: otherUserId },
              { senderId: otherUserId, receiverId: userId },
            ],
          },
          annonceId ? { annonceId } : {},
        ],
      },
      include: {
        sender: userSummary,
        receiver: userSummary,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Marquer comme lus les messages reçus
    await this.prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false,
        ...(annonceId ? { annonceId } : {}),
      },
      data: { isRead: true },
    });

    return messages;
  }

  /**
   * Nombre de messages non lus
   */
  async countUnread(userId: string) {
    const count = await this.prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });

    return { unreadCount: count };
  }
}