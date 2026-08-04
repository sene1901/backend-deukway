import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères' })
  firstName: string;

  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  lastName: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  email?: string;

  // Format souple pour numéros sénégalais et internationaux (+221771234567 ou 771234567)
  @Matches(/^(\+?\d{9,15})$/, {
    message: 'Numéro de téléphone invalide',
  })
  phone: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  // Un utilisateur s'inscrit en tant que locataire ou propriétaire.
  // Le rôle ADMIN ne doit jamais être assignable via cette route publique.
  @IsOptional()
  @IsEnum(UserRole, { message: 'Rôle invalide' })
  role?: UserRole;
}