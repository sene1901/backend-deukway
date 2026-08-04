import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Un utilisateur ne peut pas s'attribuer le rôle ADMIN
    if (createUserDto.role === UserRole.ADMIN) {
      throw new ForbiddenException('Rôle non autorisé');
    }

    // Vérification du téléphone
    const existingPhone = await this.findByPhone(createUserDto.phone);

    if (existingPhone) {
      throw new ConflictException(
        'Ce numéro de téléphone est déjà utilisé',
      );
    }

    // Vérification de l'email
    if (createUserDto.email) {
      const existingEmail = await this.findByEmail(createUserDto.email);

      if (existingEmail) {
        throw new ConflictException(
          'Cet email est déjà utilisé',
        );
      }
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    // Ne jamais retourner le mot de passe
    const { password, ...result } = user;

    return result;
  }

  async findAll() {
    return this.prisma.user.findMany({
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
        emailVerified: true,
        phoneVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
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
        emailVerified: true,
        phoneVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByLogin(login: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: login }, { phone: login }],
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}