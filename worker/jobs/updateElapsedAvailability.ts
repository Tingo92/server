import { map, size } from 'lodash';
import moment from 'moment-timezone';
import VolunteerModel from '../../models/Volunteer';
import { Volunteer } from '../../models/types';
import { log } from '../logger';
import { AvailabilitySnapshot } from '../../models/Availability/Snapshot';
import {
  createAvailabilityHistory,
  getAvailability,
  getElapsedAvailability
} from '../../services/AvailabilityService';

export default async (): Promise<void> => {
  const volunteers = await VolunteerModel.find()
    .select({ isOnboarded: 1, isApproved: 1 })
    .lean()
    .exec();

  await Promise.all(
    map(volunteers, async (volunteer: Volunteer) => {
      // A volunteer must be onboarded and approved before calculating their elapsed availability
      if (!volunteer.isApproved || !volunteer.isOnboarded) return;

      const availability: AvailabilitySnapshot = await getAvailability({
        volunteerId: volunteer._id
      });
      if (!availability) return;

      const endOfYesterday = moment()
        .subtract(1, 'days')
        .endOf('day');
      const yesterday = moment()
        .subtract(1, 'days')
        .format('dddd');
      const availabilityDay = availability.onCallAvailability[yesterday];
      const elapsedAvailability = getElapsedAvailability(availabilityDay);

      await VolunteerModel.updateOne(
        {
          _id: volunteer._id
        },
        { $inc: { elapsedAvailability } }
      );

      const newAvailabilityHistory = {
        availability: availabilityDay,
        volunteerId: volunteer._id,
        timezone: availability.timezone,
        date: endOfYesterday
      };
      return createAvailabilityHistory(newAvailabilityHistory);
    })
  );
  log(`updated ${size(volunteers)} volunteers`);
};
