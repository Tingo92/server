import moment from 'moment-timezone';
import { Query, Types } from 'mongoose';
import AvailabilitySnapshotModel, {
  AvailabilitySnapshot,
  AvailabilitySnapshotDocument
} from '../models/Availability/Snapshot';
import AvailabilityHistoryModel, {
  AvailabilityHistory,
  AvailabilityHistoryDocument
} from '../models/Availability/History';
import { Availability, AvailabilityDay } from '../models/Availability/types';
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

export const getAvailabilities = (
  query,
  projection = {}
): Promise<AvailabilitySnapshot[]> => {
  return AvailabilitySnapshotModel.find(query)
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

// @todo: Create a compound index on date and volunteerId
export const getRecentAvailabilityHistory = async (
  volunteerId
): Promise<AvailabilityHistory> => {
  const [document] = await AvailabilityHistoryModel.find({ volunteerId })
    .sort({ date: -1 })
    .limit(1)
    .lean()
    .exec();

  return document;
};

// @todo: Create a compound index on createdAt(or date) and volunteerId
export const getAllHistoryOn = async ({
  volunteerId,
  date
}): Promise<AvailabilityHistory[]> => {
  const startOfDay = moment(date)
    .utc()
    .startOf('day')
    .format();
  const endOfDay = moment(date)
    .utc()
    .endOf('day')
    .format();

  return AvailabilityHistoryModel.find({
    volunteerId,
    date: { $gte: new Date(startOfDay), $lte: new Date(endOfDay) }
  })
    .sort({ date: 1 })
    .lean()
    .exec();
};

export const getElapsedAvailabilityForDateRange = async (
  volunteerId,
  fromDate,
  toDate
): Promise<number> => {
  const [result] = await AvailabilityHistoryModel.aggregate([
    {
      $match: {
        volunteerId,
        date: {
          $gte: new Date(fromDate),
          $lte: new Date(toDate)
        }
      }
    },
    {
      $project: {
        elapsedAvailability: 1,
        volunteerId: 1
      }
    },
    {
      $group: {
        _id: '$volunteerId',
        totalElapsedAvailability: {
          $sum: '$elapsedAvailability'
        }
      }
    },
    {
      $project: { _id: 0, totalElapsedAvailability: 1 }
    }
  ]);

  return result.totalElapsedAvailability;
};

// Calculates the elapsed availability between two dates
export const calculateElapsedAvailability = ({
  availability,
  fromDate,
  toDate
}: {
  availability: Availability;
  fromDate: Date | string;
  toDate: Date | string;
}): number => {
  const fromDateEst = moment(fromDate)
    .tz('America/New_York')
    .format();
  const toDateEst = moment(toDate)
    .tz('America/New_York')
    .format();

  // Convert availability to an object formatted with the day of the week
  // as the property and the amount of hours they have available for that day as the value
  // e.g { Monday: 10, Tuesday: 3 }
  const totalAvailabilityHoursMapped = countAvailabilityHours(availability);

  // Count the occurrence of days of the week between a start and end date
  const frequencyOfDaysList = getFrequencyOfDays(
    removeTimeFromDate(fromDateEst),
    removeTimeFromDate(toDateEst)
  );

  let totalHours = calculateTotalHours(
    totalAvailabilityHoursMapped,
    frequencyOfDaysList
  );

  // Deduct the amount hours that fall outside of the start and end date time
  const outOfRangeHours = countOutOfRangeHours(
    fromDateEst,
    toDateEst,
    availability
  );
  totalHours -= outOfRangeHours;

  return totalHours;
};

export const createAvailabilitySnapshot = (
  volunteerId
): Promise<AvailabilitySnapshotDocument> =>
  AvailabilitySnapshotModel.create({ volunteerId });

export const updateAvailabilitySnapshot = (
  volunteerId,
  update
): Query<AvailabilitySnapshotDocument> =>
  AvailabilitySnapshotModel.updateOne(
    {
      volunteerId
    },
    update
  );

export const createAvailabilityHistory = (data: {
  availability: AvailabilityDay;
  volunteerId: Types.ObjectId;
  timezone: string;
  date: Date;
  elapsedAvailability: number;
}): Promise<AvailabilityHistoryDocument> =>
  AvailabilityHistoryModel.create(data);
