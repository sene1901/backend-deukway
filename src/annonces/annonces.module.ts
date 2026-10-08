import { Module } from '@nestjs/common';

import { AnnoncesController } from './annonces.controller';
import { AnnoncesService } from './annonces.service';

import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; 
@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [AnnoncesController],
  providers: [AnnoncesService],
})
export class AnnoncesModule {}