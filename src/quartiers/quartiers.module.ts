import { Module } from '@nestjs/common';

import { QuartiersController } from './quartiers.controller';
import { QuartiersService } from './quartiers.service';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QuartiersController],
  providers: [QuartiersService],
})
export class QuartiersModule {}