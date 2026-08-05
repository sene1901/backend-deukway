import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const publicUserSelect = {
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
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    if (createUserDto.role === UserRole.ADMIN) {
      throw new ForbiddenException('Rôle non autorisé');
    }

    const existingPhone = await this.findByPhone(createUserDto.phone);

    if (existingPhone) {
      throw new ConflictException(
        'Ce numéro de téléphone est déjà utilisé',
      );
    }

    if (createUserDto.email) {
      const existingEmail = await this.findByEmail(createUserDto.email);

      if (existingEmail) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    const { password, ...result } = user;

    return result;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: publicUserSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return user;
  }

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByLogin(login: string) {
    return this.prisma.user.findFirst({
      where: { OR: [{ email: login }, { phone: login }] },
    });
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: publicUserSelect,
    });
  }

  async suspend(id: string) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: publicUserSelect,
    });
  }

  async activate(id: string) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { isActive: true },
      select: publicUserSelect,
    });
  }

  async verify(id: string) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { isVerified: true },
      select: publicUserSelect,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.user.delete({ where: { id } });

    return {
      success: true,
      message: 'Utilisateur supprimé avec succès',
    };
  }
}