import { map, size } from 'lodash';
import VolunteerModel from '../../models/Volunteer';
import { Volunteer } from '../../models/types';
import { log } from '../logger';
import { calculateElapsedAvailability } from '../../controllers/UserCtrl';
import { AvailabilitySnapshot } from '../../models/Availability/Snapshot';
import AvailabilityHistoryModel, {
  AvailabilityHistory
} from '../../models/Availability/History';
import {
  getAvailability,
  getRecentAvailabilityHistory
} from '../../services/AvailabilityService';
import getTodaysDay from '../../utils/get-todays-day';

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
      // @todo: decide if availability snapshot should be created when a volunteer is created or when they add time to schedule
      const availability: AvailabilitySnapshot = await getAvailability({
        volunteerId: volunteer._id
      });
      if (!availability) return;

      const currentDate = new Date();
      const newAvailabilityHistory: Partial<AvailabilityHistory> = {
        availability: availability.onCallAvailability[getTodaysDay()],
        volunteerId: volunteer._id,
        createdAt: currentDate,
        timezone: availability.timezone
      };

      // A volunteer must be onboarded and approved before calculating their elapsed availability
      if (!volunteer.isApproved || !volunteer.isOnboarded) {
        newAvailabilityHistory.elapsedAvailability = 0;
        return AvailabilityHistoryModel.create(newAvailabilityHistory);
      }

      // Get the lastest elapsed availability calculation date from the most recent availability history
      // @note: New first day volunteer accounts will have no availability history if they have not updated their availbility
      const recentAvailabilityHistory = await getRecentAvailabilityHistory(
        volunteer._id
      );
      const elapsedAvailability = calculateElapsedAvailability({
        availability: availability.onCallAvailability,
        currentDate,
        lastCalculatedAt: recentAvailabilityHistory
          ? recentAvailabilityHistory.createdAt
          : availability.createdAt // @todo: should modifiedAt default when created?
      });

      await VolunteerModel.updateOne(
        {
          _id: volunteer._id
        },
        { $inc: { elapsedAvailability } }
      );

      newAvailabilityHistory.elapsedAvailability = elapsedAvailability;
      return AvailabilityHistoryModel.create(newAvailabilityHistory);
    })
  );
  log(`updated ${size(volunteers)} volunteers`);
};
