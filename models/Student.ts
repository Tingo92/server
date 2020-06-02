import { Schema, Types } from 'mongoose';
import UserModel, { User } from './User';
import { School } from './School';

export interface Student extends User {
  approvedHighschool: School;
  zipCode: string;
  studentPartnerOrg: string;
}

const schemaOptions = {
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
};

const studentSchema = new Schema(
  {
    approvedHighschool: {
      type: Types.ObjectId,
      ref: 'School'
      /* TODO validate approvedHighschool.isApproved: true
       * if this.isVolunteer is false */
    },
    zipCode: String,
    studentPartnerOrg: String
  },
  schemaOptions
);

// Use the user schema as the base schema for Student
const StudentModel = UserModel.discriminator<Student>('Student', studentSchema);

module.exports = StudentModel;
export default StudentModel;
