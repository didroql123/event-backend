import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserEvent,
  UserEventDocument,
} from './user-participation.schema';
import { Reward, RewardDocument } from '../reward/reward.schema';

@Injectable()
export class UserParticipationService {
  constructor(
    @InjectModel(UserEvent.name)
    private userModel: Model<UserEventDocument>,
    @InjectModel('Event')
    private eventModel: Model<any>,
    @InjectModel('Reward')
    private rewardModel: Model<RewardDocument>,
  ) {}

  async participate(email: string, event_id: number) {
    const user = await this.userModel.findOne({ email });
    if (user && user.parti_id.some((p) => p.event_id === event_id)) {
      throw new BadRequestException('이미 참여한 이벤트입니다.');
    }

    const event = await this.eventModel.findOne({ event_id });
    if (!event) throw new NotFoundException('해당 이벤트가 존재하지 않습니다.');
    if (!event.valid || new Date(event.date.end_date) < new Date()) {
      throw new BadRequestException('이미 종료된 이벤트입니다.');
    }

    const newParti = {
      event_id,
      condition: 0,
      date: new Date(),
      status: false,
    };

    if (user) {
      user.parti_id.push(newParti);
      return user.save();
    } else {
      return this.userModel.create({ email, parti_id: [newParti] });
    }
  }

  async getMyParticipation(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('참여 기록이 없습니다');
    return user;
  }

  async getAllParticipation() {
    return this.userModel.find();
  }

  async deleteParticipation(email: string, event_id: number) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('유저 없음');

    user.parti_id = user.parti_id.filter((p) => p.event_id !== event_id);
    return user.save();
  }

  async completeMission(email: string, event_id: number) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('유저 없음');

    const target = user.parti_id.find((p) => p.event_id === event_id);
    if (!target) throw new NotFoundException('참여 기록 없음');
    if (target.status) throw new BadRequestException('이미 완료된 미션입니다');

    const event = await this.eventModel.findOne({ event_id });
    if (!event) throw new NotFoundException('이벤트 정보 없음');
    if (!event.valid || new Date(event.date.end_date) < new Date()) {
      throw new BadRequestException('종료된 이벤트입니다.');
    }

    target.condition = Number(target.condition) + 1;

    if (target.condition >= event.condition) {
      const reward = await this.rewardModel.findOne({
        reward_id: event.reward_id,
      });

      if (!reward || reward.quantity <= 0) {
        throw new BadRequestException('보상이 존재하지 않거나 소진되었습니다.');
      }

      reward.quantity -= 1;
      if (reward.quantity === 0) {
        event.valid = false;
        await event.save();
      }

      await reward.save();
      target.status = true;
    }

    await user.save();
    return {
      message: '미션 처리 완료',
      보상지급여부: target.status,
    };
  }
  // ✅ 특정 이벤트 참여자 필터링
async getByEventId(event_id: number) {
  const allUsers = await this.userModel.find();
  return allUsers.filter((user) =>
    user.parti_id.some((p) => p.event_id === event_id),
  );
}

// ✅ 보상 상태별 참여자 필터링 (status: true or false)
async getByStatus(status: boolean) {
  const allUsers = await this.userModel.find();

  return allUsers
    .map((user) => {
      const filtered = user.parti_id.filter((p) => p.status === status);
      return filtered.length > 0 ? { email: user.email, parti_id: filtered } : null;
    })
    .filter((user) => user !== null);
}


}
