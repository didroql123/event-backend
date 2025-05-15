import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reward, RewardDocument } from './reward.schema';

@Injectable()
export class RewardService {
  constructor(@InjectModel(Reward.name) private rewardModel: Model<RewardDocument>) {}

  async create(data: any) {
    const reward = new this.rewardModel(data);
    return reward.save();
  }

  async findAll() {
    return this.rewardModel.find().exec();
  }

  async update(id: string, updateData: any) {
    return this.rewardModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async updateQuantity(id: string, quantity: number) {
    return this.rewardModel.findByIdAndUpdate(id, { quantity }, { new: true });
  }

  async delete(id: string) {
    return this.rewardModel.findByIdAndDelete(id);
  }
}
