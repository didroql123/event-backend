import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { EventModule } from './event/event.module';
import { AuthModule } from './auth/auth.module';
import { RewardModule } from './reward/reward.module';
import { UserParticipationModule } from './user-participation/user-participation.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI),
    EventModule,
    AuthModule,
    RewardModule,
    UserParticipationModule,
  ],
})
export class AppModule {}