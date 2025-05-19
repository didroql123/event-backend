import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEvent, UserEventSchema } from './user-participation.schema';
import { UserParticipationService } from './user-participation.service';
import { UserParticipationController } from './user-participation.controller';
import { EventSchema } from '../event/event.schema';
import { Reward, RewardSchema } from '../reward/reward.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: UserEvent.name, schema: UserEventSchema },
    { name: Event.name, schema: EventSchema },
    { name: Reward.name, schema: RewardSchema }])],
  controllers: [UserParticipationController],
  providers: [UserParticipationService],
})
export class UserParticipationModule {}
