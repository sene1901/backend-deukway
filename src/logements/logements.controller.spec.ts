import { Test, TestingModule } from '@nestjs/testing';
import { LogementsController } from './logements.controller';
import { LogementsService } from './logements.service';

describe('LogementsController', () => {
  let controller: LogementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogementsController],
      providers: [LogementsService],
    }).compile();

    controller = module.get<LogementsController>(LogementsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
