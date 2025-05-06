import { Test, TestingModule } from '@nestjs/testing';
import { NavigationsController } from './navigations.controller';
import { NavigationsService } from './navigations.service';

describe('NavigationsController', () => {
  let controller: NavigationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NavigationsController],
      providers: [NavigationsService],
    }).compile();

    controller = module.get<NavigationsController>(NavigationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
