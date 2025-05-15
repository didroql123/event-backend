import { Test, TestingModule } from '@nestjs/testing';
import { UserParticipationController } from './user-participation.controller';

describe('UserParticipationController', () => {
  let controller: UserParticipationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserParticipationController],
    }).compile();

    controller = module.get<UserParticipationController>(UserParticipationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
