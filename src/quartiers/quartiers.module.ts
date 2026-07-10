import { Module } from '@nestjs/common';
import { QuartiersService } from './quartiers.service';
import { QuartiersController } from './quartiers.controller';

@Module({
  controllers: [QuartiersController],
  providers: [QuartiersService],
})
export class QuartiersModule {}
