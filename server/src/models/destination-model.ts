import { model, Schema, SchemaTypes, Types } from 'mongoose';

interface IDestination {
  name: string,
  description?: string,
  type_id?: Types.ObjectId,
  is_system?: boolean,
  is_unique?: boolean,
  created_at: Date,
  updated_at?: Date,
  actived_route: any
};

const destinationSchema = new Schema({
  name: { required: true, trim: true, unique: true, type: String },
  description: { required: false, trim: true, type: String },
  type_id: { required: false, type: SchemaTypes.ObjectId, ref: 'types' },
  is_system: { required: false, type: Boolean, default: false },
  is_unique: { required: false, type: Boolean, default: false },
  created_at: { required: true, type: Date, default: Date.now },
  updated_at: { required: false, type: Date }
});

destinationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret, options) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

export default model<IDestination>('destinations', destinationSchema);