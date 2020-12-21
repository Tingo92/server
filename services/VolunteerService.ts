import VolunteerModel from '../models/Volunteer';
import { getTimeTutoredForDateRange } from './SessionService';
import { getElapsedAvailabilityForDateRange } from './AvailabilityService';
import { getPassedQuizzesForDateRange } from './UserActionService';

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
  totalCoachingHours: number;
  totalPassedQuizzes: number;
  totalElapsedAvailability: number;
  totalVolunteerHours: number;
}> => {
  // @todo: promise.all fails fast, do we want this? - handle error
  const [
    passedQuizzes,
    elapsedAvailability,
    timeTutoredMS
  ] = await Promise.all([
    getPassedQuizzesForDateRange(volunteerId, fromDate, toDate),
    getElapsedAvailabilityForDateRange(volunteerId, fromDate, toDate),
    getTimeTutoredForDateRange(volunteerId, fromDate, toDate)
  ]);

  const timeTutoredInHours = Number(timeTutoredMS / 3600000).toFixed(2);
  const totalCoachingHours = Number(timeTutoredInHours);
  // Total volunteer hours calculation: [sum of coaching, elapsed avail/10, and quizzes]
  const totalVolunteerHours =
    totalCoachingHours + passedQuizzes.length + elapsedAvailability * 0.1;
  return {
    totalCoachingHours,
    totalPassedQuizzes: passedQuizzes.length,
    totalElapsedAvailability: elapsedAvailability,
    totalVolunteerHours: totalVolunteerHours
  };
};
