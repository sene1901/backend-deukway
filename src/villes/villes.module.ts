import { Module } from '@nestjs/common';
import { VillesService } from './villes.service';
import { VillesController } from './villes.controller';

@Module({
  controllers: [VillesController],
  providers: [VillesService],
})
export class VillesModule {}
