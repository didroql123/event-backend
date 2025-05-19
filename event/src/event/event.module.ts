import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './event.schema';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { Reward, RewardSchema } from '../reward/reward.schema';
import { EventSchedulerService } from './event.scheduler';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Event.name, schema: EventSchema },
    { name: Reward.name, schema: RewardSchema },
  ])],
  controllers: [EventController],
  providers: [EventService, EventSchedulerService],
})
export class EventModule {}
