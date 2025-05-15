import { Test, TestingModule } from '@nestjs/testing';
import { UserParticipationService } from './user-participation.service';

describe('UserParticipationService', () => {
  let service: UserParticipationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserParticipationService],
    }).compile();

    service = module.get<UserParticipationService>(UserParticipationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
