import { Module } from '@nestjs/common';
import { LogementsService } from './logements.service';
import { LogementsController } from './logements.controller';

@Module({
  controllers: [LogementsController],
  providers: [LogementsService],
})
export class LogementsModule {}
