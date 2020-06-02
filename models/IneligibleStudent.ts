import { Document, model, Schema, Types } from 'mongoose';

export interface IneligibleStudent extends Document {
  createdAt: Date;
  zipCode: string;
  school: Types.ObjectId;
  ipAddress: string;
}

const ineligibleStudentSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  zipCode: String,
  school: {
    type: Types.ObjectId,
    ref: 'School'
  },
  ipAddress: String
});

const IneligibleStudentModel = model<IneligibleStudent>(
  'IneligibleStudent',
  ineligibleStudentSchema
);

module.exports = IneligibleStudentModel;
export default IneligibleStudentModel;
