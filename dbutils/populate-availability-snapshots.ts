import mongoose from 'mongoose';
import dbconnect from './dbconnect';
import AvailabilitySnapshotModel from '../models/Availability/Snapshot';
import VolunteerModel from '../models/Volunteer';

const upgrade = async (): Promise<void> => {
  try {
    await dbconnect();

    const volunteers: any = await VolunteerModel.find({})
      .lean()
      .exec();

    const updates = [];
    for (const volunteer of volunteers) {
      updates.push(
        AvailabilitySnapshotModel.create({
          volunteerId: volunteer._id,
          onCallAvailability: volunteer.availability,
          modifiedAt: volunteer.availabilityLastModifiedAt,
          createdAt: volunteer.createdAt,
          timezone: volunteer.timezone
        })
      );
    }

    const results = await Promise.all(updates);
    console.log(results);
  } catch (error) {
    console.error(error);
  }

  mongoose.disconnect();
};

const upgradeTwo = async (): Promise<void> => {
  try {
    await dbconnect();

    const volunteers: any = await VolunteerModel.find({})
      .select({
        _id: 1,
        availability: 1,
        availabilityLastModifiedAt: 1,
        createdAt: 1,
        timezone: 1
      })
      .lean()
      .exec();

    const docs = [];
    for (const volunteer of volunteers) {
      docs.push({
        volunteerId: volunteer._id,
        onCallAvailability: volunteer.availability,
        modifiedAt: volunteer.availabilityLastModifiedAt,
        createdAt: volunteer.createdAt,
        timezone: volunteer.timezone
      });
    }

    const results = await AvailabilitySnapshotModel.insertMany(docs);
    console.log(results);
  } catch (error) {
    console.error(error);
  }

  mongoose.disconnect();
};

// upgrade();
upgradeTwo();
