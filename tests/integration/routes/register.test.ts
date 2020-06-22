import mongoose, { Types } from 'mongoose';
import request, { Test } from 'supertest';
import Student from '../../../models/Student';
import app from '../../../app';
import School from '../../../models/School';
import testHighSchools from '../../../seeds/schools/test_high_schools.json';
import UserAction from '../../../models/UserAction';
import { USER_ACTION } from '../../../constants';
import Volunteer from '../../../models/Volunteer';
jest.mock('../../../services/MailService');

// @todo: clean up - use the Student interface from Student.ts when available
interface Student {
  email: string;
  firstName: string;
  highSchoolId: string;
  lastName: string;
  password: string;
  zipCode: string;
  studentPartnerOrg: string;
  referredByCode: string;
  terms?: boolean; // @todo:  properly handle terms - property is not part of a Student
}

// @todo: clean up - use the Volunteer interface from Volunteer.ts when available
interface Volunteer {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  zipCode: string;
  college: string;
  volunteerPartnerOrg?: string;
  favoriteAcademicSubject: string;
  referredByCode: Types.ObjectId | Volunteer;
  phone: string;
  terms?: boolean; // @todo: properly handle terms - property is not part of a Volunteer
}

const US_IP_ADDRESS = '161.185.160.93';

const registerStudent = (student: Student): Test =>
  request(app)
    .post('/auth/register/student')
    .set('X-Forwarded-For', US_IP_ADDRESS)
    .set('Accept', 'application/json')
    .send(student);

const registerOpenVolunteer = (volunteer: Volunteer): Test =>
  request(app)
    .post('/auth/register/volunteer/open')
    .set('X-Forwarded-For', US_IP_ADDRESS)
    .set('Accept', 'application/json')
    .send(volunteer);

const registerPartnerVolunteer = (volunteer: Volunteer): Test =>
  request(app)
    .post('/auth/register/volunteer/partner')
    .set('X-Forwarded-For', US_IP_ADDRESS)
    .set('Accept', 'application/json')
    .send(volunteer);

const createStudent = (options: Partial<Student> = {}): Student => {
  const student = {
    email: 'student1@upchieve.org',
    firstName: 'Student',
    highSchoolId: '23456789',
    lastName: 'UPchieve',
    password: 'Password123',
    terms: true,
    zipCode: '11201',
    studentPartnerOrg: 'example',
    referredByCode: ''
  };

  return Object.assign(student, options);
};

const createVolunteer = (options: Partial<Volunteer> = {}): Volunteer => {
  const volunteer = {
    email: 'volunteer1@upchieve.org',
    firstName: 'Volunteer',
    lastName: 'UPchieve',
    password: 'Password123',
    zipCode: '11201',
    referredByCode: '',
    college: 'Columbia University',
    favoriteAcademicSubject: 'Computer Science',
    phone: '+12345678910',
    terms: true
  };

  return Object.assign(volunteer, options);
};

// db connection
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Student registration', () => {
  beforeAll(async () => {
    School.insertMany(testHighSchools);
  });

  test('Student did not agree with the terms', async () => {
    const studentOptions = { terms: false };
    const newStudent = createStudent(studentOptions);

    const response = await registerStudent(newStudent).expect(422);

    const {
      body: { err }
    } = response;

    const expectedErrorMessage = 'Must accept the user agreement';

    expect(err).toEqual(expectedErrorMessage);
  });

  test('Student did not provide an email', async () => {
    const studentOptions = { email: '' };
    const newStudent = createStudent(studentOptions);

    const response = await registerStudent(newStudent).expect(422);

    const {
      body: { err }
    } = response;

    const expectedErrorMessage =
      'Must supply an email and password for registration';

    expect(err).toEqual(expectedErrorMessage);
  });

  test('Student did not provide a password', async () => {
    const studentOptions = { password: '' };
    const newStudent = createStudent(studentOptions);

    const response = await registerStudent(newStudent).expect(422);

    const {
      body: { err }
    } = response;

    const expectedErrorMessage =
      'Must supply an email and password for registration';

    expect(err).toEqual(expectedErrorMessage);
  });

  test('Student did not provide a sufficient password', async () => {
    const studentOptions = { password: 'password' };
    const newStudent = createStudent(studentOptions);
    const response = await registerStudent(newStudent).expect(422);

    const {
      body: { err }
    } = response;

    const expectedErrorMessage =
      'Password must contain at least one uppercase letter';

    expect(err).toEqual(expectedErrorMessage);
  });

  test('Student is not with a valid student partner organization', async () => {
    const studentOptions = {
      highSchoolId: '',
      zipCode: '',
      studentPartnerOrg: 'invalid'
    };
    const newStudent = createStudent(studentOptions);
    const response = await registerStudent(newStudent).expect(422);

    const {
      body: { err }
    } = response;

    const expectedErrorMessage = 'Invalid student partner organization';

    expect(err).toEqual(expectedErrorMessage);
  });

  test('Student registers with a highschool that is not approved and no partner org', async () => {
    const studentOptions = {
      highSchoolId: '12345678',
      zipCode: '',
      studentPartnerOrg: ''
    };
    const newStudent = createStudent(studentOptions);
    const response = await registerStudent(newStudent).expect(422);

    const {
      body: { err }
    } = response;

    const expectedErrorMessage = `School ${studentOptions.highSchoolId} is not approved`;

    expect(err).toEqual(expectedErrorMessage);
  });

  describe('Successful student registration', () => {
    beforeEach(async () => {
      await Student.remove({});
    });

    test('Create a student from outside the US', async () => {
      const canadianIpAddress = '162.219.162.233';
      const newStudent = createStudent();
      const response = await registerStudent(newStudent)
        .set('X-Forwarded-For', canadianIpAddress)
        .expect(200);

      const {
        body: { user }
      } = response;
      const expectedBannedStatus = {
        isBanned: true,
        banReason: 'NON US SIGNUP'
      };

      expect(user).toMatchObject(expectedBannedStatus);
    });

    test('Student was referred from another student', async () => {
      // Create the first student
      const newStudentOne = createStudent();
      const studentOneResponse = await registerStudent(newStudentOne).expect(
        200
      );

      const {
        body: { user: studentOne }
      } = studentOneResponse;
      const studentOneReferralCode = studentOne.referralCode;
      const studentOneId = studentOne._id;

      // Create the second student
      const studentTwoOptions = {
        email: 'student2@upchieve.org',
        referredByCode: studentOneReferralCode
      };
      const newStudentTwo = createStudent(studentTwoOptions);
      const studentTwoResponse = await registerStudent(newStudentTwo).expect(
        200
      );

      const {
        body: { user: studentTwo }
      } = studentTwoResponse;

      const result = studentTwo.referredBy;
      const expected = studentOneId;

      expect(result).toEqual(expected);
    });

    test('Student registered with a student partner org', async () => {
      const studentOptions = {
        highSchoolId: '',
        zipCode: '',
        studentPartnerOrg: 'example'
      };
      const newStudent = createStudent(studentOptions);
      const response = await registerStudent(newStudent).expect(200);

      const {
        body: { user }
      } = response;

      const expectedStudentPartnerOrg = 'example';
      const result = user.studentPartnerOrg;

      expect(result).toEqual(expectedStudentPartnerOrg);
    });

    test('User action account created was created', async () => {
      const newStudent = createStudent();
      const response = await registerStudent(newStudent).expect(200);

      const {
        body: { user }
      } = response;
      const { _id } = user;

      const userAction = await UserAction.findOne({ user: _id });

      const result = userAction.action;
      const expected = USER_ACTION.ACCOUNT.CREATED;

      expect(result).toEqual(expected);
    });

    test.todo('Test if MailService was invoked');
  });
});

describe('Open volunteer registration', () => {
  test('Open volunteer did not agree with the terms', async () => {
    const volunteerOptions = { terms: false };
    const newVolunteer = createVolunteer(volunteerOptions);

    const response = await registerOpenVolunteer(newVolunteer).expect(422);

    const {
      body: { err }
    } = response;

    const expectedErrorMessage = 'Must accept the user agreement';

    expect(err).toEqual(expectedErrorMessage);
  });

  test('Open volunteer did not provide an email', async () => {
    const volunteerOptions = { email: '' };
    const newVolunteer = createVolunteer(volunteerOptions);

    const response = await registerOpenVolunteer(newVolunteer).expect(422);

    const {
      body: { err }
    } = response;

    const expectedErrorMessage =
      'Must supply an email and password for registration';

    expect(err).toEqual(expectedErrorMessage);
  });

  test('Open volunteer did not provide a password', async () => {
    const volunteerOptions = { password: '' };
    const newVolunteer = createVolunteer(volunteerOptions);

    const response = await registerOpenVolunteer(newVolunteer).expect(422);

    const {
      body: { err }
    } = response;

    const expectedErrorMessage =
      'Must supply an email and password for registration';

    expect(err).toEqual(expectedErrorMessage);
  });

  test('Open volunteer did not provide a sufficient password', async () => {
    const volunteerOptions = { password: 'password' };
    const newVolunteer = createVolunteer(volunteerOptions);
    const response = await registerOpenVolunteer(newVolunteer).expect(422);

    const {
      body: { err }
    } = response;

    const expectedErrorMessage =
      'Password must contain at least one uppercase letter';

    expect(err).toEqual(expectedErrorMessage);
  });

  describe('Successful open volunteer registration', () => {
    beforeEach(async () => {
      await Volunteer.remove({});
    });

    test('Open volunteer creates a new account', async () => {
      const newVolunteer = createVolunteer();
      const response = await registerOpenVolunteer(newVolunteer).expect(200);

      const {
        body: { user }
      } = response;

      const expectedFirstName = newVolunteer.firstName;
      const expectedEmail = newVolunteer.email;

      expect(user.firstname).toEqual(expectedFirstName);
      expect(user.email).toEqual(expectedEmail);
      expect(user.isApproved).toBeFalsy();
    });
  });
});

describe('Partner volunteer registration', () => {
  test('Partner volunteer did not agree with the terms', async () => {
    const volunteerOptions = { terms: false };
    const newVolunteer = createVolunteer(volunteerOptions);

    const response = await registerPartnerVolunteer(newVolunteer).expect(422);

    const {
      body: { err }
    } = response;

    const expectedErrorMessage = 'Must accept the user agreement';

    expect(err).toEqual(expectedErrorMessage);
  });

  test('Partner volunteer did not provide an email', async () => {
    const volunteerOptions = { email: '' };
    const newVolunteer = createVolunteer(volunteerOptions);

    const response = await registerPartnerVolunteer(newVolunteer).expect(422);

    const {
      body: { err }
    } = response;

    const expectedErrorMessage =
      'Must supply an email and password for registration';

    expect(err).toEqual(expectedErrorMessage);
  });

  test('Partner volunteer did not provide a password', async () => {
    const volunteerOptions = { password: '' };
    const newVolunteer = createVolunteer(volunteerOptions);

    const response = await registerPartnerVolunteer(newVolunteer).expect(422);

    const {
      body: { err }
    } = response;

    const expectedErrorMessage =
      'Must supply an email and password for registration';

    expect(err).toEqual(expectedErrorMessage);
  });

  test('Partner volunteer did not provide a sufficient password', async () => {
    const volunteerOptions = { password: 'password' };
    const newVolunteer = createVolunteer(volunteerOptions);
    const response = await registerPartnerVolunteer(newVolunteer).expect(422);

    const {
      body: { err }
    } = response;

    const expectedErrorMessage =
      'Password must contain at least one uppercase letter';

    expect(err).toEqual(expectedErrorMessage);
  });

  test('Partner volunteer did not provide a valid partner organization', async () => {
    const volunteerOptions = { volunteerPartnerOrg: '' };
    const newVolunteer = createVolunteer(volunteerOptions);
    const response = await registerPartnerVolunteer(newVolunteer).expect(422);

    const {
      body: { err }
    } = response;

    const expectedErrorMessage = 'Invalid volunteer partner organization';

    expect(err).toEqual(expectedErrorMessage);
  });

  test('Partner volunteer did not provide a valid partner organization email', async () => {
    const volunteerOptions = { volunteerPartnerOrg: 'example' };
    const newVolunteer = createVolunteer(volunteerOptions);
    const response = await registerPartnerVolunteer(newVolunteer).expect(422);

    const {
      body: { err }
    } = response;

    const expectedErrorMessage =
      'Invalid email domain for volunteer partner organization';

    expect(err).toEqual(expectedErrorMessage);
  });

  describe('Successful partner volunteer registration', () => {
    beforeEach(async () => {
      await Volunteer.remove({});
    });

    test('Partner volunteer creates a new account', async () => {
      const volunteerOptions = {
        volunteerPartnerOrg: 'example',
        email: 'volunteer1@example.com'
      };
      const newVolunteer = createVolunteer(volunteerOptions);
      const response = await registerPartnerVolunteer(newVolunteer).expect(200);

      const {
        body: { user }
      } = response;

      const expectedFirstName = newVolunteer.firstName;
      const expectedEmail = newVolunteer.email;

      expect(user.firstname).toEqual(expectedFirstName);
      expect(user.email).toEqual(expectedEmail);
      expect(user.isApproved).toBeTruthy();
    });
  });
});
