import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { normalizeLogin } from '../utils/normalize';

export class LoginDto {
  @Transform(({ value }) => normalizeLogin(value))
  @IsString() @IsNotEmpty()
  login: string;

  @IsString() @IsNotEmpty()
  password: string;
}