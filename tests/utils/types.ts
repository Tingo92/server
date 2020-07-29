import { SUBJECTS } from '../../models/Volunteer';

export interface RegistrationForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  referredByCode: string;
  terms: boolean;
  zipCode: string;
  partnerUserId: string;
}

export interface StudentRegistrationForm extends RegistrationForm {
  studentPartnerOrg: string;
  highSchoolId: string;
}

export interface VolunteerRegistrationForm extends RegistrationForm {
  volunteerPartnerOrg: string;
  phone: string;
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

export interface CertificationInfo {
  passed: boolean;
  tries: number;
  lastAttemptedAt?: Date;
}

export interface Certifications {
  [SUBJECTS.PREALGREBA]: CertificationInfo;
  [SUBJECTS.ALGREBA]: CertificationInfo;
  [SUBJECTS.GEOMETRY]: CertificationInfo;
  [SUBJECTS.TRIGONOMETRY]: CertificationInfo;
  [SUBJECTS.PRECALCULUS]: CertificationInfo;
  [SUBJECTS.CALCULUS]: CertificationInfo;
  [SUBJECTS.INTEGRATED_MATH_ONE]: CertificationInfo;
  [SUBJECTS.INTEGRATED_MATH_TWO]: CertificationInfo;
  [SUBJECTS.INTEGRATED_MATH_THREE]: CertificationInfo;
  [SUBJECTS.INTEGRATED_MATH_FOUR]: CertificationInfo;
  [SUBJECTS.APPLICATIONS]: CertificationInfo;
  [SUBJECTS.ESSAYS]: CertificationInfo;
  [SUBJECTS.PLANNING]: CertificationInfo;
  [SUBJECTS.BIOLOGY]: CertificationInfo;
  [SUBJECTS.CHEMISTRY]: CertificationInfo;
  [SUBJECTS.PHYSICS_ONE]: CertificationInfo;
}
