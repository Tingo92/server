import { Document } from 'mongoose';
import bcrypt from 'bcrypt';
import Volunteer from '../../models/Volunteer';
import Student from '../../models/Student';
import School from '../../models/School';
import Message from '../../models/Message';
import Feedback from '../../models/Volunteer';
import IpAddress from '../../models/Volunteer';
import Session from '../../models/Volunteer';
import UserAction from '../../models/Volunteer';
import Notification from '../../models/Notification';
import config from '../../config';

const hashPassword = async function(password): Promise<Error | string> {
  try {
    const salt = await bcrypt.genSalt(config.saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    throw new error(error);
  }
};

export const resetDb = async (): Promise<void> => {
  Volunteer.remove({});
  Student.remove({});
  School.remove({});
  Message.remove({});
  Feedback.remove({});
  IpAddress.remove({});
  Session.remove({});
  UserAction.remove({});
  Notification.remove({});
};

export const insertVolunteer = async (volunteer): Promise<Document> => {
  const hashedPassword = await hashPassword(volunteer.password);
  return Volunteer.create({ ...volunteer, password: hashedPassword });
};

export const insertStudent = async (student): Promise<Document> => {
  const hashedPassword = await hashPassword(student.password);
  return Student.create({ ...student, password: hashedPassword });
};
