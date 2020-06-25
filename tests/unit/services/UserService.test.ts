// import mongoose from 'mongoose';
// import UserService from '../../../services/UserService';
// import VolunteerModel from '../../../models/Volunteer';
// import {
//   PHOTO_ID_STATUS,
//   LINKEDIN_STATUS,
//   REFERENCE_STATUS
// } from '../../../constants';
// import { Volunteer } from '../../utils/types';
// import {
//   buildVolunteer,
//   buildReference,
//   buildReferenceForm,
//   buildLinkedInData,
//   buildPhotoIdData,
//   buildReferenceWithForm
// } from '../../utils/generate';
// import { insertVolunteer, resetDb } from '../../utils/db-utils';

// beforeAll(async () => {
//   await mongoose.connect(process.env.MONGO_URL, {
//     useNewUrlParser: true
//   });
// });

// afterAll(async () => {
//   await mongoose.connection.close();
// });

// beforeEach(async () => {
//   await resetDb();
// });

// test('Successfully adds photoIdS3Key and photoIdStatus', async () => {
//   const volunteer = buildVolunteer();
//   await insertVolunteer(volunteer);
//   const { _id: userId } = volunteer;
//   const newPhotoIdS3Key = await UserService.addPhotoId({ userId });

//   const updatedVolunteer: Partial<Volunteer> = await VolunteerModel.findOne({
//     _id: userId
//   })
//     .select('photoIdS3Key photoIdStatus')
//     .lean()
//     .exec();

//   expect(newPhotoIdS3Key).toMatch(/^[a-f0-9]{64}$/);
//   expect(updatedVolunteer.photoIdS3Key).toEqual(newPhotoIdS3Key);
//   expect(updatedVolunteer.photoIdStatus).toEqual(PHOTO_ID_STATUS.SUBMITTED);
//   expect(updatedVolunteer.photoIdStatus).not.toEqual(PHOTO_ID_STATUS.EMPTY);
// });

// test('Submits valid LinkedIn url', async () => {
//   const volunteer = buildVolunteer();
//   await insertVolunteer(volunteer);
//   const { _id: userId } = volunteer;
//   const linkedInUrl = 'https://www.linkedin.com/in/volunteer/';
//   const input = {
//     userId,
//     linkedInUrl
//   };
//   const isValidLinkedIn = await UserService.addLinkedIn(input);

//   const updatedVolunteer: Partial<Volunteer> = await VolunteerModel.findOne({
//     _id: userId
//   })
//     .select('linkedInUrl linkedInStatus')
//     .lean()
//     .exec();

//   expect(isValidLinkedIn).toBeTruthy();
//   expect(updatedVolunteer.linkedInUrl).toEqual(linkedInUrl);
//   expect(updatedVolunteer.linkedInStatus).toEqual(LINKEDIN_STATUS.SUBMITTED);
//   expect(updatedVolunteer.linkedInStatus).not.toEqual(LINKEDIN_STATUS.EMPTY);
// });

// test('Submits invalid LinkedIn url', async () => {
//   const volunteer = buildVolunteer();
//   await insertVolunteer(volunteer);
//   const { _id: userId } = volunteer;
//   const linkedInUrl = 'https://www.linkedin.com/company/upchieve/';
//   const input = {
//     userId,
//     linkedInUrl
//   };
//   const isValidLinkedIn = await UserService.addLinkedIn(input);

//   const updatedVolunteer: Partial<Volunteer> = await VolunteerModel.findOne({
//     _id: userId
//   })
//     .select('linkedInUrl linkedInStatus')
//     .lean()
//     .exec();

//   expect(isValidLinkedIn).toBeFalsy();
//   expect(updatedVolunteer.linkedInUrl).toBeUndefined();
//   expect(updatedVolunteer.linkedInStatus).toEqual(LINKEDIN_STATUS.EMPTY);
// });

// test('Should add a reference', async () => {
//   const volunteer = buildVolunteer();
//   await insertVolunteer(volunteer);
//   const { _id: userId } = volunteer;
//   const reference = buildReference();
//   const input = {
//     userId,
//     referenceName: reference.name,
//     referenceEmail: reference.email
//   };

//   await UserService.addReference(input);

//   const updatedVolunteer: Partial<Volunteer> = await VolunteerModel.findOne({
//     _id: userId
//   })
//     .select('references')
//     .lean()
//     .exec();

//   const expectedResult = {
//     name: input.referenceName,
//     email: input.referenceEmail,
//     status: REFERENCE_STATUS.UNSENT
//   };

//   expect(updatedVolunteer.references[0]).toMatchObject(expectedResult);
//   expect(updatedVolunteer.references.length).toEqual(1);
// });

// test('Should delete a reference', async () => {
//   const referenceOne = buildReference();
//   const referenceTwo = buildReference();
//   const references = [referenceOne, referenceTwo];
//   const volunteer = buildVolunteer({ references });
//   await insertVolunteer(volunteer);

//   const { _id: userId } = volunteer;
//   const input = {
//     userId,
//     referenceEmail: referenceOne.email
//   };

//   await UserService.deleteReference(input);

//   const updatedVolunteer: Partial<Volunteer> = await VolunteerModel.findOne({
//     _id: userId
//   })
//     .select('references')
//     .lean()
//     .exec();

//   const remainingReference = {
//     name: referenceTwo.name,
//     email: referenceTwo.email,
//     status: REFERENCE_STATUS.UNSENT
//   };

//   const removedReference = {
//     name: referenceOne.name,
//     email: referenceOne.email
//   };

//   expect(updatedVolunteer.references.length).toEqual(1);
//   expect(updatedVolunteer.references).not.toContainEqual(
//     expect.objectContaining({ ...removedReference })
//   );
//   expect(updatedVolunteer.references[0]).toMatchObject(remainingReference);
// });

// test('Should save reference form data', async () => {
//   const reference = buildReference();
//   const references = [reference];
//   const volunteer = buildVolunteer({ references });
//   await insertVolunteer(volunteer);
//   const { _id: userId } = volunteer;

//   const referenceFormInput = {
//     referenceId: reference._id,
//     referenceFormData: buildReferenceForm()
//   };

//   await UserService.saveReferenceForm(referenceFormInput);

//   const {
//     references: updatedReferences
//   }: Partial<Volunteer> = await VolunteerModel.findOne({
//     _id: userId
//   })
//     .select('references')
//     .lean()
//     .exec();

//   const [updatedReference] = updatedReferences;

//   expect(updatedReference).toMatchObject(referenceFormInput.referenceFormData);
// });

// test.todo('Admin should get pending volunteers');

// test('Pending volunteer should not be approved after being rejected', async () => {
//   const options = {
//     references: [buildReferenceWithForm(), buildReferenceWithForm()],
//     ...buildLinkedInData(),
//     ...buildPhotoIdData()
//   };
//   const volunteer = buildVolunteer(options);
//   await insertVolunteer(volunteer);
//   const input = {
//     volunteerId: volunteer._id,
//     photoIdStatus: PHOTO_ID_STATUS.APPROVED,
//     referencesStatus: [REFERENCE_STATUS.APPROVED, REFERENCE_STATUS.REJECTED],
//     linkedInStatus: LINKEDIN_STATUS.REJECTED
//   };

//   await UserService.updatePendingVolunteerStatus(input);
//   const updatedVolunteer = await VolunteerModel.findOne({ _id: volunteer._id })
//     .lean()
//     .select('photoIdStatus references.status linkedInStatus isApproved')
//     .exec();

//   const expectedResult = {
//     photoIdStatus: input.photoIdStatus,
//     linkedInStatus: input.linkedInStatus,
//     references: [
//       { status: input.referencesStatus[0] },
//       { status: input.referencesStatus[1] }
//     ],
//     isApproved: false
//   };

//   expect(updatedVolunteer).toMatchObject(expectedResult);
// });

// test('Pending volunteer should be approved after approval', async () => {
//   const options = {
//     references: [buildReferenceWithForm()],
//     ...buildLinkedInData(),
//     ...buildPhotoIdData()
//   };
//   const volunteer = buildVolunteer(options);
//   await insertVolunteer(volunteer);
//   const input = {
//     volunteerId: volunteer._id,
//     photoIdStatus: PHOTO_ID_STATUS.APPROVED,
//     referencesStatus: [REFERENCE_STATUS.APPROVED],
//     linkedInStatus: LINKEDIN_STATUS.APPROVED
//   };

//   await UserService.updatePendingVolunteerStatus(input);
//   const updatedVolunteer = await VolunteerModel.findOne({ _id: volunteer._id })
//     .lean()
//     .select('photoIdStatus references.status linkedInStatus isApproved')
//     .exec();

//   const expectedResult = {
//     photoIdStatus: input.photoIdStatus,
//     linkedInStatus: input.linkedInStatus,
//     references: [{ status: input.referencesStatus[0] }],
//     isApproved: true
//   };

//   expect(updatedVolunteer).toMatchObject(expectedResult);
// });
