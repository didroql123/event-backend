import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserEventDocument = UserEvent & Document;

@Schema()
export class UserEvent {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({
    type: [
      {
        event_id: Number,
        condition: Number,
        date: Date,
        status: Boolean,
      },
    ],
    default: [],
  })
  parti_id: {
    event_id: number;
    condition: Number;
    date: Date;
    status: boolean;
  }[];
}

export const UserEventSchema = SchemaFactory.createForClass(UserEvent);
