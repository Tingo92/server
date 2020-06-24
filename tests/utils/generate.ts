import faker from 'faker';
import { Test } from 'supertest';
import {
  Volunteer,
  Student,
  StudentRegistrationForm,
  VolunteerRegistrationForm,
  Reference
} from './types';

export const getEmail = faker.internet.email;
export const getFirstName = faker.name.firstName;
export const getLastName = faker.name.lastName;
const getId = faker.random.uuid;

export const buildStudent = (overrides = {}): Student => {
  const firstName = getFirstName();
  const lastName = getLastName();
  const student = {
    email: getEmail().toLowerCase(),
    firstName,
    lastName,
    firstname: firstName,
    lastname: lastName,
    highSchoolId: '23456789',
    password: 'Password123',
    zipCode: '11201',
    studentPartnerOrg: 'example',
    referredByCode: '',
    referralCode: getId(),
    ...overrides
  };

  return student;
};

export const buildVolunteer = (overrides = {}): Volunteer => {
  const firstName = getFirstName();
  const lastName = getLastName();
  const volunteer = {
    email: getEmail().toLowerCase(),
    firstName,
    lastName,
    firstname: firstName,
    lastname: lastName,
    password: 'Password123',
    zipCode: '11201',
    referredByCode: '',
    college: 'Columbia University',
    favoriteAcademicSubject: 'Computer Science',
    phone: '+12345678910',
    referralCode: getId(),
    ...overrides
  };

  return volunteer;
};

export const buildStudentRegistrationForm = (
  overrides = {}
): StudentRegistrationForm => {
  const student = buildStudent();
  const form = {
    terms: true,
    ...student,
    ...overrides
  };

  return form;
};

export const buildVolunteerRegistrationForm = (
  overrides = {}
): VolunteerRegistrationForm => {
  const volunteer = buildVolunteer();
  const form = {
    terms: true,
    ...volunteer,
    ...overrides
  };

  return form;
};

export const buildReference = (): Partial<Reference> => {
  const referenceName = `${getFirstName()} ${getLastName()}`;
  const referenceEmail = getEmail();

  return { name: referenceName, email: referenceEmail };
};

export const authLogin = (agent, { email, password }): Test =>
  agent
    .post('/auth/login')
    .set('Accept', 'application/json')
    .send({ email, password });
