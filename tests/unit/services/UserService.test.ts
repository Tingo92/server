import mongoose from 'mongoose';
import UserService from '../../../services/UserService';
import Volunteer from '../../../models/Volunteer';
import {
  PHOTO_ID_STATUS,
  LINKEDIN_STATUS,
  REFERENCE_STATUS
} from '../../../constants';

interface References {
  _id: mongoose.Types.ObjectId;
  status: string;
  email: string;
  name: string;
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

// @todo: clean up - use the Volunteer interface from Volunteer.ts when available
interface Volunteer {
  _id: mongoose.Types.ObjectId;
  photoIdS3Key: string;
  photoIdStatus: string;
  linkedInUrl: string;
  linkedInStatus: string;
  references: Array<References>;
}

let volunteer;

// db connection
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true
  });

  const volunteerData = {
    email: 'volunteer1@upchieve.org',
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
  volunteer.referralCode = '123';

  try {
    volunteer.password = await volunteer.hashPassword(password);
    await volunteer.save();
  } catch (error) {
    throw new Error(error);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

test('Successfully adds photoIdS3Key and photoIdStatus', async () => {
  const { _id: userId } = volunteer;
  const photoIdS3Key = await UserService.addPhotoId({ userId });

  const updatedVolunteer: Partial<Volunteer> = await Volunteer.findOne({
    _id: userId
  })
    .select('photoIdS3Key photoIdStatus')
    .lean()
    .exec();

  // @todo: assert photoIdS3Key to regex expression
  expect(updatedVolunteer.photoIdS3Key).toEqual(photoIdS3Key);
  expect(updatedVolunteer.photoIdStatus).toEqual(PHOTO_ID_STATUS.SUBMITTED);
  expect(updatedVolunteer.photoIdStatus).not.toEqual(PHOTO_ID_STATUS.EMPTY);
});

test('Submits valid LinkedInUrl', async () => {
  const { _id: userId } = volunteer;
  const linkedInUrl = 'https://www.linkedin.com/in/volunteer/';
  const input = {
    userId,
    linkedInUrl
  };
  const isValidLinkedIn = await UserService.addLinkedIn(input);

  const updatedVolunteer: Partial<Volunteer> = await Volunteer.findOne({
    _id: userId
  })
    .select('linkedInUrl linkedInStatus')
    .lean()
    .exec();

  expect(isValidLinkedIn).toBeTruthy();
  expect(updatedVolunteer.linkedInUrl).toEqual(linkedInUrl);
  expect(updatedVolunteer.linkedInStatus).toEqual(LINKEDIN_STATUS.SUBMITTED);
  expect(updatedVolunteer.linkedInStatus).not.toEqual(LINKEDIN_STATUS.EMPTY);
});

test('Submits invalid LinkedInUrl', async () => {
  // @todo: Need to create a volunteer on every test?
  const { _id: userId } = volunteer;
  const linkedInUrl = 'https://www.linkedin.com/company/upchieve/';
  const input = {
    userId,
    linkedInUrl
  };
  const isValidLinkedIn = await UserService.addLinkedIn(input);

  const updatedVolunteer: Partial<Volunteer> = await Volunteer.findOne({
    _id: userId
  })
    .select('linkedInUrl linkedInStatus')
    .lean()
    .exec();

  expect(isValidLinkedIn).toBeFalsy();
  // expect(updatedVolunteer.linkedInUrl).toEqual('');
  // expect(updatedVolunteer.linkedInStatus).toEqual(LINKEDIN_STATUS.EMPTY);
  // expect(updatedVolunteer.linkedInStatus).not.toEqual(
  //   LINKEDIN_STATUS.SUBMITTED
  // );
});

test('Should add a reference', async () => {
  // @todo: Need to create a volunteer on every test?
  const { _id: userId } = volunteer;
  const input = {
    userId,
    referenceName: 'Jane Doe',
    referenceEmail: 'janedoe@anon.com'
  };

  await UserService.addReference(input);

  expect(volunteer.references.length).toEqual(0);

  const updatedVolunteer: Partial<Volunteer> = await Volunteer.findOne({
    _id: userId
  })
    .select('references')
    .lean()
    .exec();

  const expectedResult = {
    name: input.referenceName,
    email: input.referenceEmail,
    status: REFERENCE_STATUS.UNSENT
  };

  expect(updatedVolunteer.references).toContainEqual(
    expect.objectContaining({ ...expectedResult })
  );
  expect(updatedVolunteer.references.length).toEqual(1);
});

test('Should delete a reference', async () => {
  // @todo: Need to create a volunteer on every test?
  const { _id: userId } = volunteer;
  const input = {
    userId,
    referenceName: 'John Doe',
    referenceEmail: 'johndoe@anon.com'
  };

  // @todo: clean up and use a factory method to create the volunteer
  await UserService.addReference(input);

  const updatedVolunteer: Partial<Volunteer> = await Volunteer.findOne({
    _id: userId
  })
    .select('references')
    .lean()
    .exec();

  const expectedResult = {
    name: input.referenceName,
    email: input.referenceEmail,
    status: REFERENCE_STATUS.UNSENT
  };

  expect(updatedVolunteer.references).toContainEqual(
    expect.objectContaining({ ...expectedResult })
  );

  await UserService.deleteReference(input);

  const updatedVolunteerTwo: Partial<Volunteer> = await Volunteer.findOne({
    _id: userId
  })
    .select('references')
    .lean()
    .exec();

  expect(updatedVolunteerTwo.references).not.toContainEqual(
    expect.objectContaining({ ...expectedResult })
  );
});

test('Reference form should save', async () => {
  // @todo: Need to create a volunteer on every test?
  const { _id: userId } = volunteer;
  const input = {
    userId,
    referenceName: 'John Doe',
    referenceEmail: 'johndoe@anon.com'
  };

  // @todo: clean up and use a factory method to create the volunteer
  await UserService.addReference(input);

  const { references }: Partial<Volunteer> = await Volunteer.findOne({
    _id: userId
  })
    .select('references')
    .lean()
    .exec();

  const [referenceOne] = references;
  const referenceFormInput = {
    referenceId: referenceOne._id,
    referenceFormData: {
      affiliation: 'Manager',
      relationshipLength: '2 years',
      patient: 4,
      positiveRoleModel: 4,
      agreeableAndApproachable: 4,
      communicatesEffectively: 4,
      trustworthyWithChildren: 4,
      rejectionReason: 'N/A',
      additionalInfo: 'Great person to work with!'
    }
  };

  expect(referenceOne.affiliation).toBeUndefined();

  await UserService.saveReferenceForm(referenceFormInput);

  const {
    references: updatedReferences
  }: Partial<Volunteer> = await Volunteer.findOne({
    _id: userId
  })
    .select('references')
    .lean()
    .exec();

  const [updatedReference] = updatedReferences;

  expect(updatedReference).toMatchObject(referenceFormInput.referenceFormData);
});
