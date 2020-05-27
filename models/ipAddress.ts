import { values } from 'lodash';
import { Document, model, Schema, Types } from 'mongoose';
import { IP_ADDRESS_STATUS } from '../constants';

export interface IpAddress extends Document {
  createdAt: Date;
  ip: string;
  users: Types.ObjectId[];
  status: IP_ADDRESS_STATUS.OK | IP_ADDRESS_STATUS.BANNED;
}

const ipAddressSchema = new Schema({
  createdAt: { type: Date, default: Date.now },

  ip: {
    type: String,
    unique: true,
    required: true
  },

  users: [{ type: Types.ObjectId, ref: 'User' }],

  status: {
    type: String,
    enum: values(IP_ADDRESS_STATUS),
    default: IP_ADDRESS_STATUS.OK
  }
});

export default model<IpAddress>('IpAddress', ipAddressSchema);
