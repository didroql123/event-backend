import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reward, RewardSchema } from './reward.schema';
import { RewardService } from './reward.service';
import { RewardController } from './reward.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Reward.name, schema: RewardSchema }])],
  controllers: [RewardController],
  providers: [RewardService],
})
export class RewardModule {}
