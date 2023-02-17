import { model, Schema } from 'mongoose';

interface IStatus {
  name: string,
  created_at: Date
};

const statusSchema = new Schema({
  name: { required: true, trim: true, unique: true, type: String },
  created_at: { required: true, type: Date, default: Date.now }
});

statusSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret, options) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

export default model<IStatus>('status', statusSchema);