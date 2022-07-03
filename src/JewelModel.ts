import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JewelDocument = Jewel & Document;

@Schema({ collection: 'TIMELESS_COLLECTION' })
export class Jewel {
  @Prop()
  jewel: string;

  @Prop()
  seed: number;

  // @Prop(
  //   raw({
  //     firstName: { type: String },
  //     lastName: { type: String },
  //   }),
  // )
  // info: Record<string, any>;
}

export const JewelSchema = SchemaFactory.createForClass(Jewel);
