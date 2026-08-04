import { IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  login: string; 
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}