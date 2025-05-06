import { Test, TestingModule } from '@nestjs/testing';
import { NavigationsService } from './navigations.service';

describe('NavigationsService', () => {
  let service: NavigationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NavigationsService],
    }).compile();

    service = module.get<NavigationsService>(NavigationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
