import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

const contractInclude = {
  tenant: {
    select: { id: true, firstName: true, lastName: true, phone: true },
  },
  owner: {
    select: { id: true, firstName: true, lastName: true, phone: true },
  },
  reservation: {
    include: {
      annonce: {
        select: {
          id: true,
          title: true,
          address: true,
          price: true,
          propertyType: true,
        },
      },
    },
  },
};

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Générer automatiquement le texte du contrat
   */
  private generateContent(params: {
    tenantName: string;
    ownerName: string;
    annonceTitle: string;
    annonceAddress: string;
    price: number;
  }): string {
    const date = new Date().toLocaleDateString('fr-FR');

    return `CONTRAT DE LOCATION

Fait le ${date}

ENTRE LES SOUSSIGNÉS :

Le Bailleur : ${params.ownerName}
ci-après désigné "le Propriétaire",

ET

Le Preneur : ${params.tenantName}
ci-après désigné "le Locataire",

IL A ÉTÉ CONVENU CE QUI SUIT :

Article 1 - Objet
Le présent contrat a pour objet la location du bien désigné ci-après :
"${params.annonceTitle}", situé à ${params.annonceAddress}.

Article 2 - Loyer
Le montant du loyer mensuel est fixé à ${params.price} FCFA.

Article 3 - Signature électronique
Ce contrat prend effet dès sa signature électronique par les deux parties
via la plateforme Deukway.

Fait en deux exemplaires électroniques, un pour chaque partie.`;
  }

  /**
   * Créer automatiquement un contrat à partir d'une réservation confirmée
   */
  async createFromReservation(reservationId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        tenant: true,
        annonce: { include: { owner: true } },
      },
    });

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable');
    }

    const existing = await this.prisma.contract.findUnique({
      where: { reservationId },
    });

    if (existing) {
      return existing;
    }

    const content = this.generateContent({
      tenantName: `${reservation.tenant.firstName} ${reservation.tenant.lastName}`,
      ownerName: `${reservation.annonce.owner.firstName} ${reservation.annonce.owner.lastName}`,
      annonceTitle: reservation.annonce.title,
      annonceAddress: reservation.annonce.address,
      price: reservation.annonce.price,
    });

    return this.prisma.contract.create({
      data: {
        content,
        reservationId,
        tenantId: reservation.tenantId,
        ownerId: reservation.annonce.ownerId,
      },
      include: contractInclude,
    });
  }

  /**
   * Mes contrats (locataire ou propriétaire)
   */
  async findMine(userId: string) {
    return this.prisma.contract.findMany({
      where: {
        OR: [{ tenantId: userId }, { ownerId: userId }],
      },
      include: contractInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: contractInclude,
    });

    if (!contract) {
      throw new NotFoundException('Contrat introuvable');
    }

    if (contract.tenantId !== userId && contract.ownerId !== userId) {
      throw new ForbiddenException(
        'Vous n\'avez pas accès à ce contrat',
      );
    }

    return contract;
  }

  /**
   * Signer électroniquement le contrat
   */
  async sign(id: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
    });

    if (!contract) {
      throw new NotFoundException('Contrat introuvable');
    }

    const isTenant = contract.tenantId === userId;
    const isOwner = contract.ownerId === userId;

    if (!isTenant && !isOwner) {
      throw new ForbiddenException(
        'Vous ne faites pas partie de ce contrat',
      );
    }

    if (isTenant && contract.tenantSignedAt) {
      throw new ForbiddenException('Vous avez déjà signé ce contrat');
    }

    if (isOwner && contract.ownerSignedAt) {
      throw new ForbiddenException('Vous avez déjà signé ce contrat');
    }

    const data: any = isTenant
      ? { tenantSignedAt: new Date() }
      : { ownerSignedAt: new Date() };

    const tenantWillBeSigned = isTenant || !!contract.tenantSignedAt;
    const ownerWillBeSigned = isOwner || !!contract.ownerSignedAt;

    if (tenantWillBeSigned && ownerWillBeSigned) {
      data.status = 'FULLY_SIGNED';
    } else if (tenantWillBeSigned) {
      data.status = 'SIGNED_BY_TENANT';
    } else if (ownerWillBeSigned) {
      data.status = 'SIGNED_BY_OWNER';
    }

    return this.prisma.contract.update({
      where: { id },
      data,
      include: contractInclude,
    });
  }
}