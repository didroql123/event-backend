import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = Event & Document;

@Schema()
export class Event {
  @Prop({ required: true })
  event_id: number;

  @Prop()
  title: string;

  @Prop()
  content: string;

  @Prop()
  reward_id: number;

  @Prop({
    type: {
      create_date: Date,
      start_date: Date,
      end_date: Date,
    },
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
}

export const EventSchema = SchemaFactory.createForClass(Event);
