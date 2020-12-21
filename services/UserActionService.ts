import { Types } from 'mongoose';
import { USER_ACTION } from '../constants';
import UserActionModel from '../models/UserAction';

// @todo: this is a temporary interface - use interface from UserAction model file once converted
export interface UserAction {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  session: Types.ObjectId;
  createdAt: Date;
  actionType: string;
  action: string;
  quizCategory: string;
  quizSubcategory: string;
  device: string;
  browser: string;
  browserVersion: string;
  operatingSystem: string;
  operatingSystemVersion: string;
  ipAddress: string;
  referenceEmail: string;
  banReason: string;
}

export const getPassedQuizzesForDateRange = (
  volunteerId,
  fromDate,
  toDate
): Promise<UserAction[]> =>
  UserActionModel.find({
    user: volunteerId,
    createdAt: {
      $gte: new Date(fromDate),
      $lte: new Date(toDate)
    },
    action: USER_ACTION.QUIZ.PASSED
  })
    .lean()
    .exec();
