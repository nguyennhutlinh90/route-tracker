import { model, Schema } from 'mongoose';

interface IUser {
  username: string,
  password: string,
  status: string,
  first_name?: string,
  last_name?: string,
  created_at: Date,
  updated_at?: Date
};

const userSchema = new Schema({
  username: { required: true, trim: true, unique: true, type: String },
  password: { required: true, trim: true, type: String },
  status: { required: true, trim: true, type: String },
  first_name: { required: false, trim: true, type: String },
  last_name: { required: false, trim: true, type: String },
  created_at: { required: true, type: Date, default: Date.now },
  updated_at: { required: false, type: Date }
});

userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret, options) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

export default model<IUser>('users', userSchema);