import { model, Schema, SchemaTypes, Types } from 'mongoose';

interface IRoute {
  user_id: Types.ObjectId,
  destination_id: Types.ObjectId,
  type_id: Types.ObjectId,
  is_system?: boolean,
  is_unique?: boolean,
  state: string,
  start_time: Date,
  end_time?: Date,
  histories: any[]
};

const routeSchema = new Schema({
  user_id: { required: true, type: SchemaTypes.ObjectId, ref: 'users' },
  destination_id: { required: true, type: SchemaTypes.ObjectId, ref: 'destinations' },
  type_id: { required: true, type: SchemaTypes.ObjectId, ref: 'types' },
  is_system: { required: false, trim: true, type: Boolean, default: false },
  is_unique: { required: false, trim: true, type: Boolean, default: false },
  state: { required: true, trim: true, type: String },
  start_time: { required: true, type: Date, default: Date.now },
  end_time: { required: false, type: Date, default: Date.now }
});

routeSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret, options) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

export default model<IRoute>('routes', routeSchema);