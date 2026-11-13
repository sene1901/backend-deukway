import { Transform } from 'class-transformer';
import {
  IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength,
} from 'class-validator';
import { UserRole } from '@prisma/client';
import { normalizePhone } from '../utils/normalize';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class RegisterDto {
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(60)
  firstName: string;

  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(60)
  lastName: string;

  @Transform(({ value }) => normalizePhone(value))
  @Matches(/^\+221(7[05-8]|3[03])\d{7}$/, { message: 'Numéro de téléphone sénégalais invalide' })
  phone: string;

  @IsString() @MinLength(8) @MaxLength(72) // bcrypt ignore tout après 72 octets
  password: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : String(value).trim().toLowerCase()))
  @IsEmail()
  email?: string;

  @IsOptional() @Transform(trim) @IsString() @MaxLength(80)
  city?: string;

  @IsOptional() @IsIn([UserRole.OWNER, UserRole.TENANT]) 
  role?: UserRole;
}