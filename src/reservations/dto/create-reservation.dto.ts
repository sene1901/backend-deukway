import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  annonceId: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  message?: string;
}