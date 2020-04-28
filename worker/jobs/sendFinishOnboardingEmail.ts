import * as Sentry from '@sentry/node';
import { size } from 'lodash';
import * as UserModel from '../../models/User';
import * as MailService from '../../services/MailService';
import { User } from '../../models/types';
import * as dbconnect from '../../dbutils/dbconnect';
import { log } from '../logger';

export default async (): Promise<void> => {
  try {
    await dbconnect();
    const volunteers = (await UserModel.find({ isVolunteer: true })
      .lean()
      .exec()) as User[];

    for (const volunteer of volunteers) {
      const { createdAt } = volunteer;
      const volunteerCreatedAtInMS: number = new Date(createdAt).getTime();
      const todaysDateInMS: number = new Date().getTime();
      const fourDays: number = 1000 * 60 * 60 * 24 * 4;
      const threeDays: number = 1000 * 60 * 60 * 24 * 3;

      if (
        volunteerCreatedAtInMS <= todaysDateInMS - threeDays &&
        volunteerCreatedAtInMS >= todaysDateInMS - fourDays
      ) {
        MailService.sendFinishOnboardingEmail({ volunteer });
      }
    }
    log(`updated ${size(volunteers)} volunteers`);
  } catch (error) {
    log(error);
    Sentry.captureException(error);
  }
};
