import { Module } from '@nestjs/common';

import { VillesController } from './villes.controller';
import { VillesService } from './villes.service';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VillesController],
  providers: [VillesService],
})
export class VillesModule {}