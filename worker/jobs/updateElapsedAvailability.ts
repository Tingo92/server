import { map, size } from 'lodash';
import moment from 'moment-timezone';
import VolunteerModel from '../../models/Volunteer';
import { Volunteer } from '../../models/types';
import { log } from '../logger';
import { calculateElapsedAvailability } from '../../controllers/UserCtrl';
import { AvailabilitySnapshot } from '../../models/Availability/Snapshot';
import {
  createAvailabilityHistory,
  getAvailability,
  getAllHistoryOn
} from '../../services/AvailabilityService';
import getDayOfWeekFromDaysAgo from '../../utils/get-day-of-week-from-days-ago';

/**
 *
 * Creates an availability history snapshot of a volunteer's elapsed availability for the day.
 * Also incremements the total elapsed availability that a volunteer has
 *
 */
export default async (): Promise<void> => {
  const volunteers = await VolunteerModel.find()
    .select({ isOnboarded: 1, isApproved: 1 })
    .lean()
    .exec();

  await Promise.all(
    map(volunteers, async (volunteer: Volunteer) => {
      // A volunteer must be onboarded and approved before calculating their elapsed availability
      if (!volunteer.isApproved || !volunteer.isOnboarded) return;

      // @todo: decide if availability snapshot should be created when a volunteer is created or when they add time to schedule
      const availability: AvailabilitySnapshot = await getAvailability({
        volunteerId: volunteer._id
      });
      if (!availability) return;

      const yesterday = moment.utc().subtract(1, 'days');
      const endOfYesterday = yesterday.endOf('day').format();

      // Get the lastest elapsed availability calculation date from the most recent availability history
      // @note: New first day volunteer accounts will have no availability history if they have not updated their availbility
      const snapshotsFromYesterday = await getAllHistoryOn({
        volunteerId: volunteer._id,
        date: yesterday
      });
      const latestSnapshotFromYesterday = snapshotsFromYesterday.pop();
      const elapsedAvailability = calculateElapsedAvailability({
        availability: availability.onCallAvailability,
        fromDate: latestSnapshotFromYesterday
          ? latestSnapshotFromYesterday.createdAt
          : availability.modifiedAt,
        toDate: endOfYesterday
      });

      await VolunteerModel.updateOne(
        {
          _id: volunteer._id
        },
        { $inc: { elapsedAvailability } }
      );

      const currentDate = new Date();
      const newAvailabilityHistory = {
        availability:
          availability.onCallAvailability[getDayOfWeekFromDaysAgo(1)],
        volunteerId: volunteer._id,
        createdAt: currentDate,
        timezone: availability.timezone,
        date: endOfYesterday,
        elapsedAvailability
      };
      return createAvailabilityHistory(newAvailabilityHistory);
    })
  );
  log(`updated ${size(volunteers)} volunteers`);
};
