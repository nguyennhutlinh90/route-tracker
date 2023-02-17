import { model, Schema } from 'mongoose';

interface IType {
  name: string,
  created_at: Date
};

const typeSchema = new Schema({
  name: { required: true, trim: true, unique: true, type: String },
  created_at: { required: true, type: Date, default: Date.now }
});

typeSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret, options) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

export default model<IType>('types', typeSchema);