import * as Sentry from '@sentry/node';
import { size } from 'lodash';
import * as UserModel from '../../models/User';
import * as MailService from '../../services/MailService';
import { User } from '../../models/types';
import * as dbconnect from '../../dbutils/dbconnect';
import { log } from '../logger';
import * as UserService from '../../services/UserService';

export default async (): Promise<void> => {
  try {
    await dbconnect();
    const volunteers = (await UserModel.find({ isVolunteer: true })
      .lean()
      .exec()) as User[];

    for (const volunteer of volunteers) {
      const {
        createdAt,
        certifications,
        availabilityLastModifiedAt,
        email,
        firstname: firstName
      } = volunteer;
      const volunteerCreatedAtInMS = new Date(createdAt).getTime();
      const todaysDateInMS = new Date().getTime();
      const fourDays = 1000 * 60 * 60 * 24 * 4;
      const threeDays = 1000 * 60 * 60 * 24 * 3;
      const isCertified = UserService.isCertified(certifications);

      if (
        (!isCertified || !availabilityLastModifiedAt) &&
        volunteerCreatedAtInMS <= todaysDateInMS - threeDays &&
        volunteerCreatedAtInMS >= todaysDateInMS - fourDays
      ) {
        MailService.sendFinishOnboardingEmail({
          availabilityLastModifiedAt,
          isCertified,
          email,
          firstName
        });
      }
    }
    log(`updated ${size(volunteers)} volunteers`);
  } catch (error) {
    log(error);
    Sentry.captureException(error);
  }
};
