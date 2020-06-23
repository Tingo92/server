import mongoose from 'mongoose';
import request, { Test } from 'supertest';

import app from '../../../app';
import Volunteer from '../../../models/Volunteer';

const agent = request.agent(app);

/**
 *
 * @todo: figure out how to mock properly
 * @note: mockImplementationOnce forces the "Volunteer recieves an error requesting photo id upload url" and "Volunteer recieves a photo id upload url" to be run in that order otherwise the tests will fail
 *
 *
 * Unable to change mock implementation from module factory:
 * see https://jestjs.io/docs/en/es6-class-mocks#calling-jestmockdocsenjest-objectjestmockmodulename-factory-options-with-the-module-factory-parameter
 * and  https://github.com/kulshekhar/ts-jest/issues/1088
 *
 */
jest.mock('aws-sdk', () => {
  return {
    S3: jest.fn(() => ({
      getSignedUrlPromise: jest
        .fn()
        .mockImplementationOnce(() => '')
        .mockImplementationOnce(
          () => 'https://photos.s3.us-east-2.amazonaws.com/12345'
        )
    }))
  };
});

// @todo: clean up - use the Volunteer interface from Volunteer.ts when available
interface Volunteer {
  password: string;
  referralCode: string;
  hashPassword: (password: string) => string;
}

let volunteer;

// const createVolunteer = async volunteerData => {
//   const volunteer: Document | Volunteer = new Volunteer(volunteerData);
//   volunteer.referralCode = UserCtrl.generateReferralCode(volunteer.id);

//   try {
//     volunteer.password = await volunteer.hashPassword(password);
//     await volunteer.save();
//   } catch (error) {
//     throw new Error(error);
//   }
// };

// db connection
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true
  });

  // Volunteer.remove({});

  const volunteerData = {
    email: 'volunteer2@upchieve.org',
    isVolunteer: true,
    isApproved: false,
    college: 'Columbia University',
    phone: '+12345678910',
    favoriteAcademicSubject: 'Computer Science',
    firstname: 'Volunteer',
    lastname: 'UPchieve',
    verified: true,
    referredBy: null,
    password: 'Password123'
  };

  const { password } = volunteerData;
  volunteer = new Volunteer(volunteerData);
  volunteer.referralCode = 'akjsndakjndkajsndkajsndksajnakj';

  try {
    volunteer.password = await volunteer.hashPassword(password);
    await volunteer.save();
  } catch (error) {
    throw new Error(error);
  }

  try {
    // console.log('the volunteer', volunteer);
    // http://localhost:3000/auth/login
    const response = await agent
      .post('/auth/login')
      .set('Accept', 'application/json')
      .send({ email: volunteer.email, password: 'Password123' });

    // console.log('the response body', response.body);
    // console.log(response);
    // const {
    //   body: { err }
    // } = response;

    // const poop = await authLogin(app, {
    //   username: volunteer.email,
    //   password: 'Password123'
    // });
    // console.log('the pop', err);
  } catch (error) {
    console.log('the error', error);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

const sendLinkedIn = (linkedInUrl): Test =>
  agent.post('/api/user/volunteer-approval/linkedin').send({ linkedInUrl });

test('Volunteer submits an invalid LinkedIn url', async () => {
  const response = await sendLinkedIn(
    'https://www.linkedin.com/company/upchieve/'
  ).expect(200);

  const {
    body: { isValidLinkedIn }
  } = response;

  expect(isValidLinkedIn).toBeFalsy();
});

test('Volunteer submits a valid LinkedIn url', async () => {
  const response = await sendLinkedIn(
    'https://www.linkedin.com/in/volunteer1/'
  ).expect(200);

  const {
    body: { isValidLinkedIn }
  } = response;

  expect(isValidLinkedIn).toBeTruthy();
});

test('Volunteer submits a reference', async () => {
  await agent
    .post('/api/user/volunteer-approval/reference')
    .send({
      referenceName: 'Volunteer 2',
      referenceEmail: 'volunteer2@upchieve.org'
    })
    .expect(200);
});

test('Volunteer deletes a reference', async () => {
  await agent
    .post('/api/user/volunteer-approval/reference/delete')
    .send({
      referenceEmail: 'volunteer2@upchieve.org'
    })
    .expect(200);
});

// @todo: clean up
// see note above for jest.mock('aws-sdk')
test('Volunteer recieves an error requesting photo id upload url', async () => {
  const response = await agent
    .get('/api/user/volunteer-approval/photo-url')
    .expect(200);

  const {
    body: { success, message }
  } = response;
  const expectedMessage = 'Pre-signed URL error';

  expect(message).toEqual(expectedMessage);
  expect(success).toBeFalsy();
});

// @todo: clean up
// see note above for jest.mock('aws-sdk')
test('Volunteer recieves a photo id upload url', async () => {
  const response = await agent
    .get('/api/user/volunteer-approval/photo-url')
    .expect(200);

  const {
    body: { success, message, uploadUrl }
  } = response;
  const expectedMessage = 'AWS SDK S3 pre-signed URL generated successfully';

  expect(message).toEqual(expectedMessage);
  expect(success).toBeTruthy();
  expect(uploadUrl).toBeTruthy();
});
