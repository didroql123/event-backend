import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './event.schema';

@Injectable()
export class EventSchedulerService {
  private readonly logger = new Logger(EventSchedulerService.name);

  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  @Cron('0 * * * *') // 매 시간 정각
  async handleAutoCloseEvents() {
    const now = new Date();
    const result = await this.eventModel.updateMany(
      {
        valid: true,
        'date.end_date': { $lt: now },
      },
      {
        $set: { valid: false, close_reason: 'expired' },
      },
    );

    if (result.modifiedCount > 0) {
      this.logger.log(`[EVENT-AUTO-CLOSE] 만료 이벤트 ${result.modifiedCount}건 종료 처리됨`);
    }
  }
}
