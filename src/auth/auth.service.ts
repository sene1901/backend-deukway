import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      const user = await this.usersService.create(dto);

      return {
        success: true,
        message: 'Compte créé avec succès',
        data: user,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

 async profile(userId: string) {
  const user = await this.usersService.findOne(userId);

  if (!user) {
    throw new UnauthorizedException('Utilisateur introuvable');
  }

  return user;
}
  async login(dto: LoginDto) {
    const user = await this.usersService.findByLogin(dto.login);

    if (!user) {
      throw new UnauthorizedException(
        'Identifiants invalides',
      );
    }

    const validPassword = await bcrypt.compare(
      dto.password,
      user.password,
    );

    if (!validPassword) {
      throw new UnauthorizedException(
        'Identifiants invalides',
      );
    }

    const payload = {
      sub: user.id,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const { password, ...result } = user;

    return {
      success: true,
      access_token: accessToken,
      user: result,
    };
  }
}