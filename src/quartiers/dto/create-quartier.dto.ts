import { IsNotEmpty, IsString } from 'class-validator';

export class CreateQuartierDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  villeId: string;
}