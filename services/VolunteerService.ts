import VolunteerModel from '../models/Volunteer';
import { getTimeTutoredForDateRange } from './SessionService';
import { getElapsedAvailabilityForDateRange } from './AvailabilityService';
import { getUnlockedSubjectsForDateRange } from './UserActionService';

export const getVolunteers = async (
  query,
  projection = {}
  // @todo: Use Volunteer interface once converted inside /models/Volunteer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> =>
  VolunteerModel.find(query)
    .select(projection)
    .lean()
    .exec();

export const getWeeklySummaryStats = async (
  volunteerId,
  fromDate,
  toDate
): Promise<{
  totalTimeTutored: number;
  totalUnlockedSubjects: number;
  totalElapsedAvailability: number;
}> => {
  // @todo: promise.all fails fast, do we want this? - handle error
  const [
    unlockedSubjects,
    elapsedAvailability,
    timeTutoredMS
  ] = await Promise.all([
    getUnlockedSubjectsForDateRange(volunteerId, fromDate, toDate),
    getElapsedAvailabilityForDateRange(volunteerId, fromDate, toDate),
    getTimeTutoredForDateRange(volunteerId, fromDate, toDate)
  ]);

  // @todo: decide display format
  const timeTutoredInHours = timeTutoredMS / (60 * 60 * 1000);

  return {
    totalTimeTutored: timeTutoredInHours,
    totalUnlockedSubjects: unlockedSubjects.length,
    totalElapsedAvailability: elapsedAvailability
  };
};
