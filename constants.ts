export const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export const UTC_TO_HOUR_MAPPING = {
  0: '12a',
  1: '1a',
  2: '2a',
  3: '3a',
  4: '4a',
  5: '5a',
  6: '6a',
  7: '7a',
  8: '8a',
  9: '9a',
  10: '10a',
  11: '11a',
  12: '12p',
  13: '1p',
  14: '2p',
  15: '3p',
  16: '4p',
  17: '5p',
  18: '6p',
  19: '7p',
  20: '8p',
  21: '9p',
  22: '10p',
  23: '11p'
};

export enum USER_ACTION_TYPE {
  QUIZ = 'QUIZ',
  SESSION = 'SESSION',
  ACCOUNT = 'ACCOUNT'
}

export enum USER_ACTION {
  QUIZ_STARTED = 'STARTED QUIZ',
  QUIZ_PASSED = 'PASSED QUIZ',
  QUIZ_FAILED = 'FAILED QUIZ',
  QUIZ_VIEWED_MATERIALS = 'VIEWED REVIEW MATERIALS',
  SESSION_REQUESTED = 'REQUESTED SESSION',
  SESSION_JOINED = 'JOINED SESSION',
  SESSION_REJOINED = 'REJOINED SESSION',
  SESSION_ENDED = 'ENDED SESSION',
  SESSION_REPLIED_YES = 'REPLIED YES TO TEXT',
  ACCOUNT_CREATED = 'CREATED',
  ACCOUNT_UPDATED_AVAILABILITY = 'UPDATED AVAILABILITY',
  ACCOUNT_UPDATED_PROFILE = 'UPDATED PROFILE',
  ACCOUNT_ADDED_PHOTO_ID = 'ADDED PHOTO ID',
  ACCOUNT_ADDED_REFERENCE = 'ADDED REFERENCE',
  ACCOUNT_COMPLETED_BACKGROUND_INFO = 'COMPLETED BACKGROUND INFORMATION',
  ACCOUNT_DELETED_REFERENCE = 'DELETED REFERENCE',
  ACCOUNT_APPROVED = 'APPROVED',
  ACCOUNT_ONBOARDED = 'ONBOARDED',
  ACCOUNT_SUBMITTED_REFERENCE_FORM = 'SUBMITTED REFERENCE FORM',
  ACCOUNT_REJECTED_PHOTO_ID = 'REJECTED PHOTO ID',
  ACCOUNT_REJECTED_REFERENCE = 'REJECTED REFERENCE'
}

export enum USER_BAN_REASON {
  NON_US_SIGNUP = 'NON US SIGNUP',
  BANNED_IP = 'USED BANNED IP',
  SESSION_REPORTED = 'SESSION REPORTED',
  BANNED_SERVICE_PROVIDER = 'BANNED SERVICE PROVIDER'
}

export enum IP_ADDRESS_STATUS {
  OK = 'OK',
  BANNED = 'BANNED'
}

export const INTEGRATED_MATH_MAPPING = {
  integratedmathone: 'integratedMathOne',
  integratedmathtwo: 'integratedMathTwo',
  integratedmaththree: 'integratedMathThree',
  integratedmathfour: 'integratedMathFour'
};

export const FORMAT_INTEGRATED_MATH = {
  integratedMathOne: 'Integrated Math 1',
  integratedMathTwo: 'Integrated Math 2',
  integratedMathThree: 'Integrated Math 3',
  integratedMathFour: 'Integrated Math 4'
};

export const PHYSICS_MAPPING = {
  physicsone: 'physicsOne'
};

export const FORMAT_PHYSICS = {
  physicsOne: 'Physics 1'
};

export enum STATUS {
  SUBMITTED = 'SUBMITTED',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED'
};

export enum PHOTO_ID_STATUS {
  EMPTY = 'EMPTY',
  SUBMITTED = 'SUBMITTED',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED'
};

export enum REFERENCE_STATUS {
  UNSENT = 'UNSENT',
  SENT = 'SENT',
  SUBMITTED = 'SUBMITTED',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED'
};

export const SESSION_REPORT_REASON = {
  STUDENT_RUDE: 'Student was rude',
  STUDENT_MISUSE: 'Student was misusing platform'
}
