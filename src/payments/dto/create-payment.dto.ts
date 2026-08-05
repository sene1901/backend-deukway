import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaymentProvider, PaymentType } from '@prisma/client';

export class CreatePaymentDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @IsEnum(PaymentType)
  type: PaymentType;

  @IsOptional()
  @IsString()
  annonceId?: string;

  @IsOptional()
  @IsString()
  reservationId?: string;
}