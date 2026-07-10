import { Test, TestingModule } from '@nestjs/testing';
import { QuartiersController } from './quartiers.controller';
import { QuartiersService } from './quartiers.service';

describe('QuartiersController', () => {
  let controller: QuartiersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuartiersController],
      providers: [QuartiersService],
    }).compile();

    controller = module.get<QuartiersController>(QuartiersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
