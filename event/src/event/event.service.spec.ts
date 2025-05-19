import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { BadRequestException } from '@nestjs/common';

describe('EventService', () => {
  let service: EventService;

  // ✅ new + save()를 흉내내는 생성자 mock
  const mockEventModel: any = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ ...data }), // 실제 저장된 event 반환
  }));

  // ✅ 클래스 메서드도 추가 (findOne, create 등)
  mockEventModel.findOne = jest.fn();
  mockEventModel.create = jest.fn(); // create는 안 써도 되지만 혹시 몰라 추가

  const mockRewardModel = {
    findOne: jest.fn(),
    updateOne: jest.fn(),
  };
  mockEventModel.findOneAndUpdate = jest.fn();
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: 'EventModel', useValue: mockEventModel },
        { provide: 'RewardModel', useValue: mockRewardModel },
      ],
    }).compile();

    service = module.get<EventService>(EventService);

    mockEventModel.findOne.mockReset();
    mockEventModel.create.mockReset();
    mockRewardModel.findOne.mockReset();
    mockRewardModel.updateOne.mockReset();
  });

  it('중복 event_id가 존재하면 에러 발생', async () => {
    mockEventModel.findOne.mockResolvedValueOnce({ event_id: 1 });

    await expect(service.create({ event_id: 1, reward_id: 10 }))
      .rejects
      .toThrow(BadRequestException);
  });

  it('존재하지 않는 reward_id는 에러 발생', async () => {
    mockEventModel.findOne.mockResolvedValueOnce({ sort: jest.fn().mockResolvedValueOnce(null) });
    mockRewardModel.findOne.mockResolvedValueOnce(null);

    await expect(service.create({
      reward_id: 999,
      title: '제목',
      content: '내용',
      condition: '조건',
      date: { start_date: new Date(), end_date: new Date() },
    })).rejects.toThrow(BadRequestException);
  });

  it('이벤트 생성 시 reward에 event_id를 연결해야 함', async () => {
    // ✅ findOne().sort(...) 체이닝 흉내
    mockEventModel.findOne.mockReturnValueOnce({
      sort: jest.fn().mockResolvedValueOnce(null),
    });

    mockRewardModel.findOne.mockResolvedValueOnce({ reward_id: 5 });
    mockRewardModel.updateOne.mockResolvedValueOnce({});

    const dto = {
      reward_id: 5,
      title: '출석 이벤트',
      content: '7일 출석 시 보상 지급',
      condition: '7일 연속 출석',
      date: {
        start_date: new Date(),
        end_date: new Date(),
      },
    };

    const result = await service.create(dto);

    expect(result.reward_id).toBe(5);
    expect(mockRewardModel.updateOne).toHaveBeenCalledWith(
      { reward_id: 5 },
      { event_id: 1 },
    );
  });
    it('이벤트가 존재하지 않으면 업데이트 실패', async () => {
    mockEventModel.findOne.mockResolvedValueOnce(null);

    await expect(service.update(999, { title: '변경' }))
      .rejects
      .toThrow('이벤트를 찾을 수 없습니다');
  });

  it('다른 이벤트에 연결된 보상으로 업데이트하려 하면 에러 발생', async () => {
    mockEventModel.findOne.mockResolvedValueOnce({
      event_id: 1,
      reward_id: 2,
    });

    mockRewardModel.findOne.mockResolvedValueOnce({
      reward_id: 3,
      event_id: 999, // 다른 이벤트에 연결됨
    });

    await expect(service.update(1, { reward_id: 3 }))
      .rejects
      .toThrow('이미 연결된 보상입니다');
  });

  it('이벤트 업데이트가 성공하면 메시지를 반환', async () => {
    mockEventModel.findOne.mockResolvedValueOnce({
      event_id: 1,
      reward_id: 2,
    });

    mockRewardModel.findOne.mockResolvedValueOnce({
      reward_id: 3,
      event_id: null,
    });

    mockRewardModel.updateOne.mockResolvedValue({});
    mockEventModel.findOneAndUpdate.mockResolvedValueOnce(true);

    const updateDto = {
      title: '업데이트된 이벤트',
      reward_id: 3,
    };

    const result = await service.update(1, updateDto);

    expect(result).toEqual({
      message: '업데이트 완료',
      updateData: updateDto,
    });

    expect(mockRewardModel.updateOne).toHaveBeenCalledWith(
      { reward_id: 3 },
      { event_id: 1 }
    );
  });
});
