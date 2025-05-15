import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RewardDocument = Reward & Document;

@Schema()
export class Reward {
  @Prop({ required: true })
  reward_id: number;

  @Prop()
  item: string;

  @Prop()
  total_quantity: number;

  @Prop()
  quantity: number;

  @Prop()
  event_id: number;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);
