import mongoose from 'mongoose';
import moment from 'moment-timezone';
import {
  getVolunteers,
  getWeeklySummaryStats
} from '../../services/VolunteerService';
import { insertVolunteer, resetDb } from '../db-utils';
import {
  buildVolunteer,
  buildSession,
  buildAvailabilityHistory,
  buildUserAction,
  buildAvailabilityDay
} from '../generate';
import SessionModel from '../../models/Session';
import AvailabilityHistoryModel from '../../models/Availability/History';
import UserActionModel from '../../models/UserAction';
import { USER_ACTION } from '../../constants';

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

describe('getVolunteers', () => {
  test('Should get volunteers given a query', async () => {
    const dateFilter = new Date('12/20/2020');
    const query = {
      createdAt: {
        $gte: dateFilter
      }
    };
    await Promise.all([
      insertVolunteer({ createdAt: new Date('12/10/2020') }),
      insertVolunteer({ createdAt: new Date('12/14/2020') }),
      insertVolunteer({ createdAt: new Date('12/21/2020') }),
      insertVolunteer({ createdAt: new Date('12/25/2020') })
    ]);

    const volunteers = await getVolunteers(query);
    expect(volunteers).toHaveLength(2);

    for (const volunteer of volunteers) {
      expect(volunteer.createdAt.getTime()).toBeGreaterThan(
        dateFilter.getTime()
      );
    }
  });
});

describe('getWeeklySummaryStats', () => {
  test('Should get weekly summary stats for a volunteer', async () => {
    const { _id: volunteerId } = buildVolunteer();
    const timeTutoredOneMin = 60000;
    const timeTutoredTwoMins = 120000;
    const action = USER_ACTION.QUIZ.UNLOCKED_SUBJECT;
    const actionType = USER_ACTION.TYPE.QUIZ;
    const today = new Date('12/21/2020');
    // last week: 12/13/2020 to 12/19/2020
    const startOfLastWeek = moment(today)
      .utc()
      .subtract(1, 'weeks')
      .startOf('week');
    const endOfLastWeek = moment(today)
      .utc()
      .subtract(1, 'weeks')
      .endOf('week');

    await SessionModel.insertMany([
      buildSession({
        createdAt: new Date('12/10/2020'),
        volunteer: volunteerId,
        timeTutored: timeTutoredOneMin
      }),
      buildSession({
        createdAt: new Date('12/14/2020'),
        volunteer: volunteerId,
        timeTutored: timeTutoredTwoMins
      }),
      buildSession({
        createdAt: new Date('12/21/2020'),
        volunteer: volunteerId,
        timeTutored: timeTutoredOneMin
      }),
      buildSession({
        createdAt: new Date('12/25/2020'),
        volunteer: volunteerId,
        timeTutored: timeTutoredTwoMins
      })
    ]);

    await AvailabilityHistoryModel.insertMany([
      buildAvailabilityHistory({
        date: new Date('12/12/2020'),
        volunteerId,
        availability: buildAvailabilityDay({ '4p': true, '5p': true })
      }),
      buildAvailabilityHistory({
        date: new Date('12/13/2020'),
        volunteerId,
        availability: buildAvailabilityDay({
          '10a': true,
          '11a': true,
          '12p': true,
          '4p': true
        })
      }),
      buildAvailabilityHistory({
        date: new Date('12/14/2020'),
        volunteerId,
        availability: buildAvailabilityDay({
          '10a': true
        })
      }),
      buildAvailabilityHistory({
        date: new Date('12/15/2020'),
        volunteerId,
        availability: buildAvailabilityDay({
          '10p': true,
          '11p': true
        })
      }),
      buildAvailabilityHistory({
        date: new Date('12/16/2020'),
        volunteerId,
        availability: buildAvailabilityDay({
          '2p': true
        })
      })
    ]);

    await UserActionModel.insertMany([
      buildUserAction({
        createdAt: new Date('12/01/2020'),
        action,
        actionType,
        user: volunteerId
      }),
      buildUserAction({
        createdAt: new Date('12/14/2020'),
        action,
        actionType,
        user: volunteerId
      }),
      buildUserAction({
        createdAt: new Date('12/21/2020'),
        action,
        actionType,
        user: volunteerId
      }),
      buildUserAction({
        createdAt: new Date('12/25/2020'),
        action,
        actionType,
        user: volunteerId
      })
    ]);

    const results = await getWeeklySummaryStats(
      volunteerId,
      startOfLastWeek,
      endOfLastWeek
    );
    const expectedStats = {
      totalUnlockedSubjects: 1,
      totalElapsedAvailability: 8
    };

    expect(results).toMatchObject(expectedStats);
  });
});
