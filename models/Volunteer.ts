import { Document, Schema, Types } from 'mongoose';
import { values } from 'lodash';
import { PHOTO_ID_STATUS, REFERENCE_STATUS } from '../constants';
import UserModel, { User } from './User';

export enum SUBJECTS {
  PREALGREBA = 'prealgebra',
  ALGREBA = 'algebra',
  GEOMETRY = 'geometry',
  TRIGONOMETRY = 'trigonometry',
  PRECALCULUS = 'precalculus',
  CALCULUS = 'calculus',
  INTEGRATED_MATH_ONE = 'integratedMathOne',
  INTEGRATED_MATH_TWO = 'integratedMathTwo',
  INTEGRATED_MATH_THREE = 'integratedMathThree',
  INTEGRATED_MATH_FOUR = 'integratedMathFour',
  APPLICATIONS = 'applications',
  ESSAYS = 'essays',
  PLANNING = 'planning',
  BIOLOGY = 'biology',
  CHEMISTRY = 'chemistry',
  PHYSICS_ONE = 'physicsOne'
}

export enum DAYS {
  SUNDAY = 'Sunday',
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday'
}

export enum HOURS {
  '12AM' = '12a',
  '1AM' = '1a',
  '2AM' = '2a',
  '3AM' = '3a',
  '4AM' = '4a',
  '5AM' = '5a',
  '6AM' = '6a',
  '7AM' = '7a',
  '8AM' = '8a',
  '9AM' = '9a',
  '10AM' = '10a',
  '11AM' = '11a',
  '12PM' = '12p',
  '1PM' = '1p',
  '2PM' = '2p',
  '3PM' = '3p',
  '4PM' = '4p',
  '5PM' = '5p',
  '6PM' = '6p',
  '7PM' = '7p',
  '8PM' = '8p',
  '9PM' = '9p',
  '10PM' = '10p',
  '11PM' = '11p'
}

export type AvailabilityDay = {
  [hour in HOURS]: boolean;
};

export type Availability = {
  [day in DAYS]: AvailabilityDay;
};

export interface Reference extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  sentAt: Date;
  affiliation: string;
  relationshipLength: string;
  patient: number;
  positiveRoleModel: number;
  agreeableAndApproachable: number;
  communicatesEffectively: number;
  trustworthyWithChildren: number;
  rejectionReason: string;
  additionalInfo: string;
}

export interface Volunteer extends User {
  volunteerPartnerOrg: string;
  isFailsafeVolunteer: boolean;
  phone: string;
  favoriteAcademicSubject: string;
  college: string;
  availability: Availability;
  timezone: string;
  availabilityLastModifiedAt: Date;
  elapsedAvailability: number;
  certifications: {
    [subject in SUBJECTS]: {
      passed: boolean;
      tries: number;
      lastAttemptedAt: Date;
    };
  };
  isApproved: boolean;
  isOnboarded: boolean;
  photoIdS3Key: string;
  photoIdStatus: string;
  references: Reference[];
  occupation: string[];
  company: string;
  experience: {
    collegeCounseling: string;
    mentoring: string;
    tutoring: string;
  };
  languages: string[];
  country: string;
  state: string;
  city: string;
  sentReadyToCoachEmail: boolean;
}

export type VolunteerDocument = Volunteer & Document;

const weeksSince = (date): number => {
  // 604800000 = milliseconds in a week
  return ((new Date().getTime() as number) - date) / 604800000;
};

const minsSince = (date): number => {
  // 60000 = milliseconds in a minute
  return ((new Date().getTime() as number) - date) / 60000;
};

const tallyVolunteerPoints = (volunteer): number => {
  let points = 0;

  // +2 points if no past sessions
  if (!volunteer.pastSessions || !volunteer.pastSessions.length) {
    points += 2;
  }

  // +1 point if volunteer is from a partner org
  if (volunteer.volunteerPartnerOrg) {
    points += 1;
  }

  // +1 point per 1 week since last notification
  if (volunteer.volunteerLastNotification) {
    points += weeksSince(new Date(volunteer.volunteerLastNotification.sentAt));
  } else {
    points += weeksSince(new Date(volunteer.createdAt));
  }

  // +1 point per 2 weeks since last session
  if (volunteer.volunteerLastSession) {
    points +=
      0.5 * weeksSince(new Date(volunteer.volunteerLastSession.createdAt));
  } else {
    points += weeksSince(new Date(volunteer.createdAt));
  }

  // -10000 points if notified recently
  if (
    volunteer.volunteerLastNotification &&
    minsSince(new Date(volunteer.volunteerLastNotification.sentAt)) < 5
  ) {
    points -= 10000;
  }

  return parseFloat(points.toFixed(2));
};

// subdocument schema for each availability day
const availabilityDaySchema = new Schema(
  {
    [HOURS['12AM']]: { type: Boolean, default: false },
    [HOURS['1AM']]: { type: Boolean, default: false },
    [HOURS['2AM']]: { type: Boolean, default: false },
    [HOURS['3AM']]: { type: Boolean, default: false },
    [HOURS['4AM']]: { type: Boolean, default: false },
    [HOURS['5AM']]: { type: Boolean, default: false },
    [HOURS['6AM']]: { type: Boolean, default: false },
    [HOURS['7AM']]: { type: Boolean, default: false },
    [HOURS['8AM']]: { type: Boolean, default: false },
    [HOURS['9AM']]: { type: Boolean, default: false },
    [HOURS['10AM']]: { type: Boolean, default: false },
    [HOURS['11AM']]: { type: Boolean, default: false },
    [HOURS['12PM']]: { type: Boolean, default: false },
    [HOURS['1PM']]: { type: Boolean, default: false },
    [HOURS['2PM']]: { type: Boolean, default: false },
    [HOURS['3PM']]: { type: Boolean, default: false },
    [HOURS['4PM']]: { type: Boolean, default: false },
    [HOURS['5PM']]: { type: Boolean, default: false },
    [HOURS['6PM']]: { type: Boolean, default: false },
    [HOURS['7PM']]: { type: Boolean, default: false },
    [HOURS['8PM']]: { type: Boolean, default: false },
    [HOURS['9PM']]: { type: Boolean, default: false },
    [HOURS['10PM']]: { type: Boolean, default: false },
    [HOURS['11PM']]: { type: Boolean, default: false }
  },
  { _id: false }
);

const availabilitySchema = new Schema(
  {
    [DAYS.SUNDAY]: {
      type: availabilityDaySchema,
      default: availabilityDaySchema
    },
    [DAYS.MONDAY]: {
      type: availabilityDaySchema,
      default: availabilityDaySchema
    },
    [DAYS.TUESDAY]: {
      type: availabilityDaySchema,
      default: availabilityDaySchema
    },
    [DAYS.WEDNESDAY]: {
      type: availabilityDaySchema,
      default: availabilityDaySchema
    },
    [DAYS.THURSDAY]: {
      type: availabilityDaySchema,
      default: availabilityDaySchema
    },
    [DAYS.FRIDAY]: {
      type: availabilityDaySchema,
      default: availabilityDaySchema
    },
    [DAYS.SATURDAY]: {
      type: availabilityDaySchema,
      default: availabilityDaySchema
    }
  },
  { _id: false }
);

const referenceSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: values(REFERENCE_STATUS),
    default: REFERENCE_STATUS.UNSENT
  },
  sentAt: Date,
  affiliation: String,
  relationshipLength: String,
  patient: Number,
  positiveRoleModel: Number,
  agreeableAndApproachable: Number,
  communicatesEffectively: Number,
  trustworthyWithChildren: Number,
  rejectionReason: String,
  additionalInfo: String
});

const volunteerSchemaOptions = {
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
};

const volunteerSchema = new Schema(
  {
    isApproved: {
      type: Boolean,
      default: false
    },
    photoIdS3Key: String,
    photoIdStatus: {
      type: String,
      enum: values(PHOTO_ID_STATUS),
      default: PHOTO_ID_STATUS.EMPTY
    },
    references: [referenceSchema],
    isOnboarded: {
      type: Boolean,
      default: false
    },
    volunteerPartnerOrg: String,
    isFailsafeVolunteer: {
      type: Boolean,
      default: false
    },
    phone: {
      type: String,
      required: true,
      trim: true
      // @todo: server-side validation of international phone format
    },
    college: String,
    occupation: [String],
    experience: {
      collegeCounseling: String,
      mentoring: String,
      tutoring: String
    },
    country: String,
    state: String,
    city: String,
    company: String,
    languages: [String],
    linkedInUrl: String,
    availability: {
      type: availabilitySchema,
      default: availabilitySchema
    },
    timezone: String,
    availabilityLastModifiedAt: { type: Date },
    elapsedAvailability: { type: Number, default: 0 },
    sentReadyToCoachEmail: {
      type: Boolean,
      default: false
    },
    certifications: {
      [SUBJECTS.PREALGREBA]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.ALGREBA]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.GEOMETRY]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.TRIGONOMETRY]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.PRECALCULUS]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.CALCULUS]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.INTEGRATED_MATH_ONE]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.INTEGRATED_MATH_TWO]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.INTEGRATED_MATH_THREE]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.INTEGRATED_MATH_FOUR]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.APPLICATIONS]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.ESSAYS]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.PLANNING]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.BIOLOGY]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.CHEMISTRY]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.PHYSICS_ONE]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      }
    }
  },
  volunteerSchemaOptions
);

volunteerSchema.virtual('volunteerPointRank').get(function() {
  if (!this.isVolunteer) return null;
  return tallyVolunteerPoints(this);
});

// Virtual that gets all notifications that this user has been sent
volunteerSchema.virtual('notifications', {
  ref: 'Notification',
  localField: '_id',
  foreignField: 'volunteer',
  options: { sort: { sentAt: -1 } }
});

volunteerSchema.virtual('volunteerLastSession', {
  ref: 'Session',
  localField: '_id',
  foreignField: 'volunteer',
  justOne: true,
  options: { sort: { createdAt: -1 } }
});

volunteerSchema.virtual('volunteerLastNotification', {
  ref: 'Notification',
  localField: '_id',
  foreignField: 'volunteer',
  justOne: true,
  options: { sort: { sentAt: -1 } }
});

// Use the user schema as the base schema for Volunteer
const VolunteerModel = UserModel.discriminator<VolunteerDocument>(
  'Volunteer',
  volunteerSchema
);

module.exports = VolunteerModel;
export default VolunteerModel;
