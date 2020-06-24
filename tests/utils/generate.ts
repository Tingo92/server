import faker from 'faker';
import {
  Volunteer,
  Student,
  StudentRegistrationForm,
  VolunteerRegistrationForm
} from './types';

const getEmail = faker.internet.email;
const getFirstName = faker.name.firstName;
const getLastName = faker.name.lastName;
const getPhoneNumber = faker.phone.phoneNumber;

const buildStudent = (overrides = {}): Student => {
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
    ...overrides
  };

  return student;
};

const buildVolunteer = (overrides = {}): Volunteer => {
  const firstName = getFirstName();
  const lastName = getLastName();
  const volunteer = {
    email: getEmail().toLowerCase(),
    firstName,
    lastName,
    firstname: firstName,
    lastname: lastName,
    password: 'Password123',
    phone: getPhoneNumber(),
    zipCode: '11201',
    referredByCode: '',
    college: 'Columbia University',
    favoriteAcademicSubject: 'Computer Science',
    // phone: '+12345678910',
    ...overrides
  };

  return volunteer;
};

const buildStudentRegistrationForm = (
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

const buildVolunteerRegistrationForm = (
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

export {
  buildStudent,
  buildVolunteer,
  buildStudentRegistrationForm,
  buildVolunteerRegistrationForm
};
