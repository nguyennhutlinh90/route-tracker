import { model, Schema, SchemaTypes, Types } from 'mongoose';

interface IRouteHistory {
  route_id: Types.ObjectId,
  status_id: Types.ObjectId,
  start_time: Date,
  end_time?: Date
};

const routeHistorySchema = new Schema({
  route_id: { required: true, type: SchemaTypes.ObjectId, ref: 'routes' },
  status_id: { required: true, type: SchemaTypes.ObjectId, ref: 'status' },
  start_time: { required: true, type: Date, default: Date.now },
  end_time: { required: false, type: Date, default: Date.now }
});

routeHistorySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret, options) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

export default model<IRouteHistory>('route_histories', routeHistorySchema);