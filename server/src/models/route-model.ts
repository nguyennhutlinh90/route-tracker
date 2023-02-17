import { model, Schema, SchemaTypes, Types } from 'mongoose';

interface IRoute {
  user_id: Types.ObjectId,
  destination_id: Types.ObjectId,
  type_id?: Types.ObjectId,
  state?: string,
  start_time?: Date,
  end_time?: Date,
  histories: any[]
};

const routeSchema = new Schema({
  user_id: { required: true, type: SchemaTypes.ObjectId, ref: 'users' },
  destination_id: { required: true, type: SchemaTypes.ObjectId, ref: 'destinations' },
  type_id: { required: false, type: SchemaTypes.ObjectId, ref: 'types' },
  state: { required: false, trim: true, type: String },
  start_time: { required: false, type: Date },
  end_time: { required: false, type: Date }
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