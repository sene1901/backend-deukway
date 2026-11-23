import { OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { RegisterDto } from './register.dto';

export class RegisterAdminDto extends OmitType(RegisterDto, ['role'] as const) {
  @IsString() @IsNotEmpty()
  adminCode: string;
}