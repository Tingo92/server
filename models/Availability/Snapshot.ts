import { Document, model, Schema, Types } from 'mongoose';
import { Availability, availabilityDaySchema, DAYS } from './types'

export interface AvailabilitySnapshot {
  _id: Types.ObjectId;
  volunteerId: Types.ObjectId;
  onCallAvailability: Availability;
  modifiedAt: Date;
  createdAt: Date;
}

export type AvailabilitySnapshotDocument = AvailabilitySnapshot & Document;

const availabilityWeekSchema = new Schema(
  {
    [DAYS.SUNDAY]: { type: availabilityDaySchema, default: availabilityDaySchema },
    [DAYS.MONDAY]: { type: availabilityDaySchema, default: availabilityDaySchema },
    [DAYS.TUESDAY]: { type: availabilityDaySchema, default: availabilityDaySchema },
    [DAYS.WEDNESDAY]: { type: availabilityDaySchema, default: availabilityDaySchema },
    [DAYS.THURSDAY]: { type: availabilityDaySchema, default: availabilityDaySchema },
    [DAYS.FRIDAY]: { type: availabilityDaySchema, default: availabilityDaySchema },
    [DAYS.SATURDAY]: { type: availabilityDaySchema, default: availabilityDaySchema }
  },
  { _id: false }
);

const availabilitySnapshotSchema = new Schema ({
  volunteerId: {
    type: Types.ObjectId
  },
  onCallAvailability: {
    type: availabilityWeekSchema,
    default: availabilityWeekSchema
  },
  modifiedAt: { type: Date },
  createdAt: { type: Date },
})

const AvailabilitySnapshotModel = model<AvailabilitySnapshotDocument>('AvailabilitySnapshot', availabilitySnapshotSchema);

module.exports = AvailabilitySnapshotModel
export default AvailabilitySnapshotModel
