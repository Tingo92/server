import { Types } from 'mongoose';
import moment from 'moment-timezone';
import { log } from '../logger';
import {
  getVolunteers,
  getWeeklySummaryStats
} from '../../services/VolunteerService';
import MailService from '../../services/MailService';

interface Volunteer {
  _id: Types.ObjectId;
  firstname: string;
  email: string;
}

// Runs every weekly at 6am EST on Monday
export default async (): Promise<void> => {
  const volunteers = await getVolunteers(
    {
      isOnboarded: true, // @todo: double check if should be approved and onboarded
      isApproved: true,
      isBanned: false,
      isDeactivated: false,
      isFakeUser: false,
      isTestUser: false,
      isAdmin: false // @todo: double check
    },
    { firstname: 1, email: 1 }
  );

  //  Sunday to Saturday
  const startOfLastWeek = moment()
    .subtract(1, 'weeks')
    .startOf('week');
  const endofLastWeek = moment()
    .subtract(1, 'weeks')
    .endOf('week');

  let totalEmailed = 0;
  for (const volunteer of volunteers) {
    const { _id, firstname, email } = volunteer as Volunteer;
    try {
      const summaryStats = await getWeeklySummaryStats(
        _id,
        startOfLastWeek,
        endofLastWeek
      );
      const data = {
        name: firstname,
        email,
        ...summaryStats
      };
      await MailService.sendWeeklySummaryEmail(data);
      totalEmailed++;
    } catch (error) {
      log(`Failed to send weekly summary email to volunteer ${_id}: ${error}`);
    }
  }

  return log(`Emailed weekly summary email to ${totalEmailed} volunteers`);
};
