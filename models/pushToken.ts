/**
 * Model that stores push token information
 * to send to users for push notifications
 *
 */
import { Document, model, Schema, Types } from 'mongoose';

export interface PushToken extends Document {
  user: Types.ObjectId;
  createdAt: Date;
  token: string;
}

const pushTokenSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User'
    },
    createdAt: { type: Date, default: Date.now },
    // Token ID returned from push token register
    token: { type: String, unique: true }
  },
  {
    toJSON: {
      virtuals: true
    },

    toObject: {
      virtuals: true
    }
  }
);

export default model<PushToken>('PushToken', pushTokenSchema);
