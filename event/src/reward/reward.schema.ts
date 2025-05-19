import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RewardDocument = Reward & Document;

@Schema()
export class Reward {
  @Prop({ required: true, unique: true })
  reward_id: number;

  @Prop({
    type: {
      name: String,
      item_type: String, // 예: 'point', 'coupon', 'item', 'currency'
    },
    required: true,
  })
  item: {
    name: string;
    type: string;
  };

  @Prop({ required: true, min: 1 })
  total_quantity: number;

  @Prop({ required: true, min: 0 })
  quantity: number;

  @Prop()
  event_id: number;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);
