import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reward, RewardDocument } from './reward.schema';

@Injectable()
export class RewardService {
  constructor(@InjectModel(Reward.name) private rewardModel: Model<RewardDocument>) {}

  async create(data: any) {
    const { item, total_quantity } = data;

    if (!item || !item.name || !item.item_type || !total_quantity) {
      throw new BadRequestException('item.name, item.type, total_quantity는 필수입니다');
    }

    data.quantity = total_quantity;

    const lastReward = await this.rewardModel.findOne().sort({ reward_id: -1 }).exec();
    const newRewardId = lastReward ? lastReward.reward_id + 1 : 1;

    const reward = new this.rewardModel({
      ...data,
      reward_id: newRewardId,
    });

    return reward.save();
  }

  async findAll() {
    return this.rewardModel.find().exec();
  }

  async update(reward_id: number, updateData: any) {
    const reward = await this.rewardModel.findOne({ reward_id });
    if (!reward) {
      throw new NotFoundException('보상을 찾을 수 없습니다');
    }

    if ('event_id' in updateData && updateData.event_id !== reward.event_id) {
      throw new BadRequestException('event_id는 수정할 수 없습니다');
    }

    if ('total_quantity' in updateData && updateData.total_quantity !== reward.total_quantity) {
      throw new BadRequestException('total_quantity는 수정할 수 없습니다');
    }

    if ('quantity' in updateData && updateData.quantity < 0) {
      throw new BadRequestException('quantity는 0 이상이어야 합니다');
    }

    // item 내부 유효성 검사 (선택적 업데이트일 때)
    if (updateData.item) {
      if (!updateData.item.name || !updateData.item.item_type) {
        throw new BadRequestException('item.name과 item.type은 필수입니다');
      }
    }

    const { event_id, total_quantity, ...updatable } = updateData;

    return this.rewardModel.findOneAndUpdate({ reward_id }, updatable, { new: true });
  }

  async delete(reward_id: number) {
    const reward = await this.rewardModel.findOne({ reward_id });
    if (!reward) {
      throw new NotFoundException('보상을 찾을 수 없습니다');
    }

    if (reward.event_id) {
      throw new BadRequestException('이 보상은 이벤트에 연결되어 있어 삭제할 수 없습니다');
    }

    return this.rewardModel.deleteOne({ reward_id });
  }
}
