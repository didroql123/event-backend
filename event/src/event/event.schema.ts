import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = Event & Document;

@Schema()
export class Event {
  @Prop({ unique: true, auto: true })
  event_id: number;

  @Prop()
  title: string;

  @Prop()
  content: string;

  @Prop()
  reward_id: number;

  @Prop({
    type: {
      create_date: { type: Date, default: () => new Date() },
      start_date: Date,
      end_date: Date,
    },
    required: true,
  })
  date: {
    create_date: Date;
    start_date: Date;
    end_date: Date;
  };

  @Prop()
  condition: string;

  @Prop({ default: true })
  valid: boolean;

  @Prop({ enum: ['expired', 'sold_out', 'manual'], required: false })
  close_reason?: 'expired' | 'sold_out' | 'manual';

}

export const EventSchema = SchemaFactory.createForClass(Event);
