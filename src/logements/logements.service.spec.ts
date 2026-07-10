import { Test, TestingModule } from '@nestjs/testing';
import { LogementsService } from './logements.service';

describe('LogementsService', () => {
  let service: LogementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogementsService],
    }).compile();

    service = module.get<LogementsService>(LogementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
