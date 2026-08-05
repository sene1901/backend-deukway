import { Module } from '@nestjs/common';

import { FavorisController } from './favoris.controller';
import { FavorisService } from './favoris.service';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FavorisController],
  providers: [FavorisService],
})
export class FavorisModule {}