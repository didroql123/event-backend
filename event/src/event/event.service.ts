import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Event, EventDocument } from './event.schema';
import { Model } from 'mongoose';

@Injectable()
export class EventService {
  constructor(@InjectModel(Event.name) private eventModel: Model<EventDocument>) {}

  async create(data: any) {
    const created = new this.eventModel(data);
    return created.save();
  }

  async findAll() {
    return this.eventModel.find().exec();
  }

  async update(id: string, updateData: any) {
    return this.eventModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id: string) {
    return this.eventModel.findByIdAndDelete(id);
  }
}
