import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// Hash factice : on compare toujours un mot de passe, même si le compte n'existe pas,
// pour que le temps de réponse ne révèle pas quels numéros sont inscrits.
const DUMMY_HASH = bcrypt.hashSync('deukway-dummy-password', 10);

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Les doublons (email/téléphone) lèvent un ConflictException 409 dans UsersService
    const user = await this.usersService.create(dto);
    return { success: true, message: 'Compte créé avec succès', data: user };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByLogin(dto.login);

    const validPassword = await bcrypt.compare(
      dto.password,
      user?.password ?? DUMMY_HASH,
    );

    if (!user || !validPassword) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Après le mot de passe : sinon on révèle qu'un compte suspendu existe
    if (!user.isActive) {
      throw new ForbiddenException('Ce compte est désactivé');
    }

    const access_token = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
    });
    const { password, ...safeUser } = user;

    return { success: true, access_token, user: safeUser };
  }

  profile(userId: string) {
    return this.usersService.findOne(userId);
  }
}