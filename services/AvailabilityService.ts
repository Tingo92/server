import moment from 'moment-timezone';
import AvailabilitySnapshotModel, {
  AvailabilitySnapshot
} from '../models/Availability/Snapshot';
import AvailabilityHistoryModel, {
  AvailabilityHistory
} from '../models/Availability/History';
import countAvailabilityHours from '../utils/count-availability-hours';
import removeTimeFromDate from '../utils/remove-time-from-date';
import getFrequencyOfDays from '../utils/get-frequency-of-days';
import calculateTotalHours from '../utils/calculate-total-hours';
import countOutOfRangeHours from '../utils/count-out-of-range-hours';

export const getAvailability = (
  query,
  projection = {}
): Promise<AvailabilitySnapshot> => {
  return AvailabilitySnapshotModel.findOne(query)
    .select(projection)
    .lean()
    .exec();
};

export const getAvailabilityHistory = (
  query,
  projection = {}
): Promise<AvailabilityHistory> => {
  return AvailabilityHistoryModel.findOne(query)
    .select(projection)
    .lean()
    .exec();
};

// @todo: Create a compound index on createdAt(or date) and volunteerId
export const getRecentAvailabilityHistory = async (
  volunteerId
): Promise<AvailabilityHistory> => {
  const [document] = await AvailabilityHistoryModel.find({ volunteerId })
    // @todo: decide on createdAt or date
    // .sort({ date: -1 })
    .sort({ createdAt: -1 })
    .limit(1)
    .lean()
    .exec();

  return document;
};

// Calculates the amount of hours between the last calculation for elapsedAvailability and the current date
export const calculateElapsedAvailability = ({
  availability,
  lastCalculatedAt,
  currentDate
}): number => {
  const lastCalculatedAtEst = moment(lastCalculatedAt)
    .tz('America/New_York')
    .format();
  const currentDateEst = moment(currentDate)
    .tz('America/New_York')
    .format();

  // Convert availability to an object formatted with the day of the week
  // as the property and the amount of hours they have available for that day as the value
  // e.g { Monday: 10, Tuesday: 3 }
  const totalAvailabilityHoursMapped = countAvailabilityHours(availability);

  // Count the occurrence of days of the week between a start and end date
  const frequencyOfDaysList = getFrequencyOfDays(
    removeTimeFromDate(lastCalculatedAtEst),
    removeTimeFromDate(currentDateEst)
  );

  let totalHours = calculateTotalHours(
    totalAvailabilityHoursMapped,
    frequencyOfDaysList
  );

  // Deduct the amount hours that fall outside of the start and end date time
  const outOfRangeHours = countOutOfRangeHours(
    lastCalculatedAtEst,
    currentDateEst,
    availability
  );
  totalHours -= outOfRangeHours;

  return totalHours;
};
