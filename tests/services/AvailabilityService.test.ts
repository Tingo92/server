import mongoose from 'mongoose';
import {
  getAvailability,
  getAvailabilities,
  getAvailabilityHistory,
  getRecentAvailabilityHistory,
  getAllHistoryOn,
  getElapsedAvailabilityForDateRange,
  calculateElapsedAvailability
} from '../../services/AvailabilityService';
import {
  insertAvailabilitySnapshot,
  insertAvailabilityHistory,
  resetDb
} from '../db-utils';
import {
  buildVolunteer,
  buildAvailabilitySnapshot,
  buildAvailabilityHistory
} from '../generate';
import AvailabilityHistoryModel from '../../models/Availability/History';
import {
  flexibleHoursSelected,
  noHoursSelected,
  allHoursSelected
} from '../mocks/volunteer-availability';
import AvailabilitySnapshotModel from '../../models/Availability/Snapshot';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await resetDb();
  jest.clearAllMocks();
});

describe('getAvailability', () => {
  test('Should get an availability document given a query', async () => {
    const snapshot = await insertAvailabilitySnapshot();
    const result = await getAvailability({
      _id: snapshot._id
    });

    expect(result._id).toEqual(snapshot._id);
    expect(result.volunteerId).toEqual(snapshot.volunteerId);
  });
});

describe('getAvailabilities', () => {
  test('Should get multiple availability documents given a query', async () => {
    const snapshots = [
      buildAvailabilitySnapshot({
        createdAt: new Date('10/10/2020')
      }),
      buildAvailabilitySnapshot({
        createdAt: new Date('10/11/2020')
      }),
      buildAvailabilitySnapshot({
        createdAt: new Date('10/10/2021')
      }),
      buildAvailabilitySnapshot({
        createdAt: new Date('10/11/2021')
      })
    ];
    await AvailabilitySnapshotModel.insertMany(snapshots);

    const dateFilter = new Date('10/01/2021');
    const results = await getAvailabilities({
      createdAt: { $gte: dateFilter }
    });
    const expectedLength = 2;
    expect(results).toHaveLength(expectedLength);

    for (const doc of results) {
      expect(doc.createdAt.getTime()).toBeGreaterThan(dateFilter.getTime());
    }
  });
});

describe('getAvailabilityHistory', () => {
  test('Should get an availability history document given a query', async () => {
    const availabilityHistory = await insertAvailabilityHistory();
    const result = await getAvailabilityHistory({
      _id: availabilityHistory._id
    });

    expect(result._id).toEqual(availabilityHistory._id);
    expect(result.volunteerId).toEqual(availabilityHistory.volunteerId);
  });
});

describe('getRecentAvailabilityHistory', () => {
  test('Should get most recent availability history for a volunteer', async () => {
    const newton = buildVolunteer();
    const volunteerId = newton._id;
    const date = new Date();
    const newestDoc = buildAvailabilityHistory({
      date,
      volunteerId
    });
    const oldestDoc = buildAvailabilityHistory({
      date: new Date('10/10/2020'),
      volunteerId
    });
    const oldDoc = buildAvailabilityHistory({
      date: new Date('10/11/2020'),
      volunteerId
    });
    await AvailabilityHistoryModel.insertMany([newestDoc, oldestDoc, oldDoc]);

    const result = await getRecentAvailabilityHistory(volunteerId);
    expect(result.date).toEqual(date);
  });
});

describe('getAllHistoryOn', () => {
  test('Should get all availability history for a volunteer on a given date', async () => {
    const euclid = buildVolunteer();
    const volunteerId = euclid._id;
    const givenDate = new Date('12/25/2020');
    await AvailabilityHistoryModel.insertMany([
      buildAvailabilityHistory({
        date: new Date('12/01/2020'),
        volunteerId
      }),
      buildAvailabilityHistory({
        date: givenDate,
        volunteerId
      }),
      buildAvailabilityHistory({
        date: givenDate,
        volunteerId
      }),
      buildAvailabilityHistory({
        date: givenDate,
        volunteerId
      }),
      buildAvailabilityHistory({
        date: new Date('12/26/2020'),
        volunteerId
      })
    ]);

    const results = await getAllHistoryOn({ volunteerId, date: givenDate });
    const expectLength = 3;
    const expectedDate = {
      month: 12,
      date: 25,
      year: 2020
    };

    expect(results).toHaveLength(expectLength);
    for (const doc of results) {
      // @note: getMonth is zero-based
      expect(doc.date.getMonth()).toEqual(expectedDate.month - 1);
      expect(doc.date.getDate()).toEqual(expectedDate.date);
      expect(doc.date.getFullYear()).toEqual(expectedDate.year);
    }
  });
});

describe('getElapsedAvailabilityForDateRange', () => {
  test('Should get the total elapsed availability for a volunteer over given a date range', async () => {
    const turing = buildVolunteer();
    const volunteerId = turing._id;
    await AvailabilityHistoryModel.insertMany([
      buildAvailabilityHistory({
        date: new Date('12/01/2020'),
        volunteerId,
        elapsedAvailability: 4
      }),
      buildAvailabilityHistory({
        date: new Date('12/02/2020'),
        volunteerId,
        elapsedAvailability: 8
      }),
      buildAvailabilityHistory({
        date: new Date('12/03/2020'),
        volunteerId,
        elapsedAvailability: 3
      }),
      buildAvailabilityHistory({
        date: new Date('12/04/2020'),
        volunteerId,
        elapsedAvailability: 1
      }),
      buildAvailabilityHistory({
        date: new Date('12/14/2020'),
        volunteerId,
        elapsedAvailability: 5
      })
    ]);

    const fromDate = '12/03/2020';
    const toDate = '12/30/2020';
    const result = await getElapsedAvailabilityForDateRange(
      volunteerId,
      fromDate,
      toDate
    );

    const expectedElapsedAvailability = 9;
    expect(result).toEqual(expectedElapsedAvailability);
  });
});

describe('calculateElapsedAvailability', () => {
  test('Elapsed availability over 3 days with no hours available', () => {
    // EST Time Zone for dates
    const lastModifiedDate = '2020-02-06T12:52:59.538-05:00';
    const newModifiedDate = '2020-02-09T13:40:00.000-05:00';

    const result = calculateElapsedAvailability({
      availability: noHoursSelected,
      fromDate: lastModifiedDate,
      toDate: newModifiedDate
    });
    const expectedElapsedAvailability = 0;
    expect(result).toBe(expectedElapsedAvailability);
  });

  test('Elapsed availability over 3 days with all hours available and 7 hours out of range', () => {
    // EST Time Zone for dates
    const lastModifiedDate = '2020-02-06T00:52:59.538-05:00';
    const newModifiedDate = '2020-02-09T19:40:00.000-05:00';

    const result = calculateElapsedAvailability({
      availability: allHoursSelected,
      fromDate: lastModifiedDate,
      toDate: newModifiedDate
    });
    const expectedElapsedAvailability = 90;
    expect(result).toBe(expectedElapsedAvailability);
  });

  test('Elapsed availability over 3 days with flexible hours available', () => {
    // EST Time Zone for dates
    const lastModifiedDate = '2020-02-06T00:52:59.538-05:00';
    const newModifiedDate = '2020-02-09T12:40:00.000-05:00';

    const result = calculateElapsedAvailability({
      availability: flexibleHoursSelected,
      fromDate: lastModifiedDate,
      toDate: newModifiedDate
    });
    const expectedElapsedAvailability = 16;
    expect(result).toBe(expectedElapsedAvailability);
  });

  /** 
   * flexibleHoursSelected mapped:
   { Sunday: 3,
    Monday: 6,
    Tuesday: 6,
    Wednesday: 5,
    Thursday: 3,
    Friday: 6,
    Saturday: 5 }
  **/
  test('Elapsed availability over 23 days with flexible hours available', () => {
    // EST Time Zone for dates
    const lastModifiedDate = '2020-02-02T05:21:39.538-05:00';
    const newModifiedDate = '2020-02-25T16:20:42.000-05:00';

    const result = calculateElapsedAvailability({
      availability: flexibleHoursSelected,
      fromDate: lastModifiedDate,
      toDate: newModifiedDate
    });
    const expectedElapsedAvailability = 114;
    expect(result).toBe(expectedElapsedAvailability);
  });
});
