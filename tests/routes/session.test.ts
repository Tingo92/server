import mongoose from 'mongoose';
import request, { Test } from 'supertest';
import app from '../../app';
import { Student } from '../types';
import { authLogin } from '../generate';
import { resetDb, insertStudent, insertSession } from '../db-utils';
import { USER_ACTION } from '../../constants';
import UserActionModel from '../../models/UserAction';
jest.mock('../../services/MailService');
jest.mock('../../services/SocketService');

const agent = request.agent(app);
// @todo: Figure out how to avoid using loginStudent for each test
//        note: does not work properly when placed in a beforeEach
const loginStudent = async (): Promise<Student> => {
  const student = await insertStudent();
  await authLogin(agent, student);

  return student;
};

const startNewSession = (data): Test =>
  agent
    .post('/api/session/new')
    .set('Accept', 'application/json')
    .send(data);

const endSession = (data): Test =>
  agent
    .post('/api/session/end')
    .set('Accept', 'application/json')
    .send(data);

// db connection
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('/session/new', () => {
  beforeEach(async () => {
    await resetDb();
  });

  const newSessionData = { sessionSubTopic: 'algebraone', sessionType: 'math' };

  test('Should start a new session', async () => {
    await loginStudent();
    const response = await startNewSession(newSessionData).expect(200);
    const {
      body: { sessionId }
    } = response;

    expect(mongoose.Types.ObjectId.isValid(sessionId)).toBeTruthy();
  });

  test('Should not start a new session for an unsupported subject', async () => {
    await loginStudent();
    const data = { sessionSubTopic: 'platonism', sessionType: 'philosophy' };
    await startNewSession(data).expect(404);
  });

  test(`Should create a ${USER_ACTION.SESSION.REQUESTED} user action`, async () => {
    const plato = await loginStudent();
    const response = await startNewSession(newSessionData).expect(200);
    const {
      body: { sessionId }
    } = response;

    const userAction = await UserActionModel.findOne({
      user: plato._id,
      session: sessionId
    });

    expect(userAction.action).toBe(USER_ACTION.SESSION.REQUESTED);
  });

  test.todo('Should not create session if server error');
});

describe.only('/session/end', () => {
  // const socketService = new SocketService(null);
  beforeEach(async () => {
    await resetDb();
  });

  // @todo: Check if SocketService has been called
  test('Should end a new session', async () => {
    const aristotle = await loginStudent();
    const { session } = await insertSession({ student: aristotle });
    const response = await endSession({ sessionId: session._id }).expect(200);
    const {
      body: { sessionId }
    } = response;

    expect(mongoose.Types.ObjectId.isValid(sessionId)).toBeTruthy();
  });

  test('Should not end session if not session participant', async () => {
    await loginStudent();
    const { session } = await insertSession();
    const response = await endSession({ sessionId: session._id }).expect(500);
    const {
      body: { err }
    } = response;

    const expectedError = 'Only session participants can end a session';

    expect(err).toEqual(expectedError);
  });

  test(`Should create a ${USER_ACTION.SESSION.ENDED} user action`, async () => {
    const aristotle = await loginStudent();
    const { session } = await insertSession({ student: aristotle });
    const response = await endSession({ sessionId: session._id }).expect(200);
    const {
      body: { sessionId }
    } = response;

    const userAction = await UserActionModel.findOne({
      user: aristotle._id,
      session: sessionId
    });

    expect(userAction.action).toBe(USER_ACTION.SESSION.ENDED);
  });
});
