import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserEvent, UserEventDocument } from './user-participation.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserParticipationService {
  constructor(@InjectModel(UserEvent.name) private userModel: Model<UserEventDocument>) {}

  async participate(email: string, participation: any) {
    const user = await this.userModel.findOne({ email });
    if (user) {
      user.parti_id.push(participation);
      return user.save();
    }
    return new this.userModel({ email, parti_id: [participation] }).save();
  }

  async getMyParticipation(email: string) {
    return this.userModel.findOne({ email });
  }

  async updateMyParticipation(email: string, updatedPartiList: any[]) {
    return this.userModel.findOneAndUpdate({ email }, { parti_id: updatedPartiList }, { new: true });
  }

  async getAll() {
    return this.userModel.find();
  }

  async delete(email: string) {
    return this.userModel.findOneAndDelete({ email });
  }
}
