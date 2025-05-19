import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Event, EventDocument } from './event.schema';
import { Reward, RewardDocument } from '../reward/reward.schema';
import { Model } from 'mongoose';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
  ) {}

  async create(data: any) {
    const { reward_id, title, content, condition, date } = data;

    // 필수값 검사
    if (!reward_id || !title || !content || !condition || !date?.start_date || !date?.end_date) {
      throw new BadRequestException('필수입력 사항이 없습니다. 보상/제목/내용/조건/시작일,종료일');
    }

    // 보상 유효성 검사
    const reward = await this.rewardModel.findOne({ reward_id });
    if (!reward) {
      throw new BadRequestException('존재하지 않는 reward_id입니다.');
    }
    if (reward.event_id) {
      throw new BadRequestException('이미 연결된 보상입니다.');
    }

    // event_id 생성
    const lastEvent = await this.eventModel.findOne().sort({ event_id: -1 });
    const newEventId = lastEvent ? lastEvent.event_id + 1 : 1;

    // 이벤트 저장
    const event = new this.eventModel({
      ...data,
      event_id: newEventId,
      date: {
        ...date,
        create_date: new Date(),
      },
    });
    const savedEvent = await event.save();

    // 보상에 이벤트 연결
    await this.rewardModel.updateOne(
      { reward_id },
      { event_id: newEventId },
    );

    return savedEvent;
  }

  async findAll() {
    return this.eventModel.find().exec();
  }

  async update(id: number, updateData: any) {
    const event = await this.eventModel.findOne({ event_id: id });
    if (!event) throw new NotFoundException('이벤트를 찾을 수 없습니다');

    const newRewardId = updateData.reward_id;
    const prevRewardId = event.reward_id;

    // 보상 유효성 검사
    if (newRewardId !== undefined) {
      const reward = await this.rewardModel.findOne({ reward_id: newRewardId });
      if (!reward) throw new BadRequestException('존재하지 않는 reward_id입니다');
      if (reward.event_id && reward.event_id !== event.event_id) {
        throw new BadRequestException(`보상 ID ${newRewardId}는 이미 다른 이벤트에 연결되어 있습니다`);
      }
    }

    // 기존 보상 해제 (보상 변경 시에만)
    if (newRewardId !== undefined && prevRewardId !== newRewardId) {
      await this.rewardModel.updateOne(
        { reward_id: prevRewardId },
        { $set: { event_id: "" } }
      );
    }

    // 새 보상 연결
    if (newRewardId !== undefined) {
      await this.rewardModel.updateOne(
        { reward_id: newRewardId },
        { event_id: event.event_id }
      );
    }

    // valid: false일 경우 자동으로 close_reason 설정
    if (updateData.valid === false && !updateData.close_reason) {
      updateData.close_reason = 'manual';
    }

    const result = await this.eventModel.findOneAndUpdate(
      { event_id: id },
      { $set: updateData },
      { new: true }
    );

    if (result) return { message: '업데이트 완료', updateData };
    else return { message: '업데이트 실패!' };
  }

  async delete(id: number) {
    const event = await this.eventModel.findOneAndDelete({ event_id: id });
    if (!event) throw new NotFoundException('이벤트를 찾을 수 없습니다');

    await this.rewardModel.updateOne(
      { event_id: event.event_id },
      { $unset: { event_id: "" } }
    );

    return { message: '이벤트 삭제 완료', deleted_event: event };
  }

  async findOne(id: number) {
    const event = await this.eventModel.findOne({ event_id: id });
    if (!event) throw new NotFoundException('이벤트를 찾을 수 없습니다');
    return event;
  }

  async findFiltered(valid?: 'true' | 'false' | 'all') {
    const now = new Date();

    if (valid === 'true') {
      return this.eventModel.find({
        valid: true,
        'date.start_date': { $lte: now },
        'date.end_date': { $gte: now },
      });
    }

    if (valid === 'false') {
      return this.eventModel.find({
        $or: [
          { valid: false },
          { 'date.end_date': { $lt: now } },
        ],
      });
    }

    return this.eventModel.find(); // 전체 조회
  }
}
