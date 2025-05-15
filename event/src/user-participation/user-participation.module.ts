import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEvent, UserEventSchema } from './user-participation.schema';
import { UserParticipationService } from './user-participation.service';
import { UserParticipationController } from './user-participation.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserEvent.name, schema: UserEventSchema }])],
  controllers: [UserParticipationController],
  providers: [UserParticipationService],
})
export class UserParticipationModule {}
