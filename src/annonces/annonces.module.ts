import { Module } from '@nestjs/common';

import { AnnoncesController } from './annonces.controller';
import { AnnoncesService } from './annonces.service';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AnnoncesController],
  providers: [AnnoncesService],
})
export class AnnoncesModule {}