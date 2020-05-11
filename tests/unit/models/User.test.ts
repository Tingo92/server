import Volunteer from '../../../models/Volunteer'
import {
  flexibleHoursSelected,
  noHoursSelected,
  allHoursSelected
} from '../../mocks/volunteer-availability'

const goodUser = new Volunteer({
  email: 'email@email.com',
  password: 'password',

  verified: true,
  verificationToken: 'verificationToken',
  registrationCode: 'registrationCode',
  passwordResetToken: 'passwordResetToken',

  // Profile data
  firstname: 'firstname',
  lastname: 'lastname',
  phone: 5555555555,

  favoriteAcademicSubject: 'favoriteAcademicSubject',
  college: 'college',

  availability: {
    Sunday: {
      '12a': false,
      '1a': false,
      '2a': false,
      '3a': false,
      '4a': false,
      '5a': false,
      '6a': false,
      '7a': false,
      '8a': false,
      '9a': false,
      '10a': false,
      '11a': false,
      '12p': false,
      '1p': false,
      '2p': false,
      '3p': false,
      '4p': false,
      '5p': false,
      '6p': false,
      '7p': false,
      '8p': false,
      '9p': false,
      '10p': false,
      '11p': false
    },
    Monday: {
      '12a': false,
      '1a': false,
      '2a': false,
      '3a': false,
      '4a': false,
      '5a': false,
      '6a': false,
      '7a': false,
      '8a': false,
      '9a': false,
      '10a': false,
      '11a': false,
      '12p': false,
      '1p': false,
      '2p': false,
      '3p': false,
      '4p': false,
      '5p': false,
      '6p': false,
      '7p': false,
      '8p': false,
      '9p': false,
      '10p': false,
      '11p': false
    },
    Tuesday: {
      '12a': false,
      '1a': false,
      '2a': false,
      '3a': false,
      '4a': false,
      '5a': false,
      '6a': false,
      '7a': false,
      '8a': false,
      '9a': false,
      '10a': false,
      '11a': false,
      '12p': false,
      '1p': false,
      '2p': false,
      '3p': false,
      '4p': false,
      '5p': false,
      '6p': false,
      '7p': false,
      '8p': false,
      '9p': false,
      '10p': false,
      '11p': false
    },
    Wednesday: {
      '12a': false,
      '1a': false,
      '2a': false,
      '3a': false,
      '4a': false,
      '5a': false,
      '6a': false,
      '7a': false,
      '8a': false,
      '9a': false,
      '10a': false,
      '11a': false,
      '12p': false,
      '1p': false,
      '2p': false,
      '3p': false,
      '4p': false,
      '5p': false,
      '6p': false,
      '7p': false,
      '8p': false,
      '9p': false,
      '10p': false,
      '11p': false
    },
    Thursday: {
      '12a': false,
      '1a': false,
      '2a': false,
      '3a': false,
      '4a': false,
      '5a': false,
      '6a': false,
      '7a': false,
      '8a': false,
      '9a': false,
      '10a': false,
      '11a': false,
      '12p': false,
      '1p': false,
      '2p': false,
      '3p': false,
      '4p': false,
      '5p': false,
      '6p': false,
      '7p': false,
      '8p': false,
      '9p': false,
      '10p': false,
      '11p': false
    },
    Friday: {
      '12a': false,
      '1a': false,
      '2a': false,
      '3a': false,
      '4a': false,
      '5a': false,
      '6a': false,
      '7a': false,
      '8a': false,
      '9a': false,
      '10a': false,
      '11a': false,
      '12p': false,
      '1p': false,
      '2p': false,
      '3p': false,
      '4p': false,
      '5p': false,
      '6p': false,
      '7p': false,
      '8p': false,
      '9p': false,
      '10p': false,
      '11p': false
    },
    Saturday: {
      '12a': true,
      '1a': true,
      '2a': true,
      '3a': true,
      '4a': true,
      '5a': true,
      '6a': true,
      '7a': true,
      '8a': true,
      '9a': true,
      '10a': true,
      '11a': true,
      '12p': true,
      '1p': true,
      '2p': true,
      '3p': true,
      '4p': true,
      '5p': true,
      '6p': true,
      '7p': true,
      '8p': true,
      '9p': true,
      '10p': true,
      '11p': true
    }
  },
  timezone: 'EST',
  pastSessions: null
})

test('Test parsed profile Object', () => {
  const parsedData = goodUser.parseProfile()

  expect(parsedData).toBe(parsedData)
  expect(parsedData.email).toBe('email@email.com')
  expect(parsedData.verified).toBe(true)
  expect(parsedData.firstname).toBe('firstname')
  expect(parsedData.lastname).toBe('lastname')
  expect(parsedData.isVolunteer).toBe(false)
  expect(parsedData.isAdmin).toBe(false)
  expect(parsedData.phone).toBe('5555555555')

  expect(parsedData.availability.Sunday['12a']).toBe(false)
  expect(parsedData.availability.Sunday['1a']).toBe(false)
  expect(parsedData.availability.Sunday['2a']).toBe(false)
  expect(parsedData.availability.Sunday['3a']).toBe(false)
  expect(parsedData.availability.Sunday['4a']).toBe(false)
  expect(parsedData.availability.Sunday['5a']).toBe(false)
  expect(parsedData.availability.Sunday['6a']).toBe(false)
  expect(parsedData.availability.Sunday['7a']).toBe(false)
  expect(parsedData.availability.Sunday['8a']).toBe(false)
  expect(parsedData.availability.Sunday['9a']).toBe(false)
  expect(parsedData.availability.Sunday['10a']).toBe(false)
  expect(parsedData.availability.Sunday['11a']).toBe(false)
  expect(parsedData.availability.Sunday['12p']).toBe(false)
  expect(parsedData.availability.Sunday['1p']).toBe(false)
  expect(parsedData.availability.Sunday['2p']).toBe(false)
  expect(parsedData.availability.Sunday['3p']).toBe(false)
  expect(parsedData.availability.Sunday['4p']).toBe(false)
  expect(parsedData.availability.Sunday['5p']).toBe(false)
  expect(parsedData.availability.Sunday['6p']).toBe(false)
  expect(parsedData.availability.Sunday['7p']).toBe(false)
  expect(parsedData.availability.Sunday['8p']).toBe(false)
  expect(parsedData.availability.Sunday['9p']).toBe(false)
  expect(parsedData.availability.Sunday['10p']).toBe(false)
  expect(parsedData.availability.Sunday['11p']).toBe(false)

  expect(parsedData.availability.Monday['12a']).toBe(false)
  expect(parsedData.availability.Monday['1a']).toBe(false)
  expect(parsedData.availability.Monday['2a']).toBe(false)
  expect(parsedData.availability.Monday['3a']).toBe(false)
  expect(parsedData.availability.Monday['4a']).toBe(false)
  expect(parsedData.availability.Monday['5a']).toBe(false)
  expect(parsedData.availability.Monday['6a']).toBe(false)
  expect(parsedData.availability.Monday['7a']).toBe(false)
  expect(parsedData.availability.Monday['8a']).toBe(false)
  expect(parsedData.availability.Monday['9a']).toBe(false)
  expect(parsedData.availability.Monday['10a']).toBe(false)
  expect(parsedData.availability.Monday['11a']).toBe(false)
  expect(parsedData.availability.Monday['12p']).toBe(false)
  expect(parsedData.availability.Monday['1p']).toBe(false)
  expect(parsedData.availability.Monday['2p']).toBe(false)
  expect(parsedData.availability.Monday['3p']).toBe(false)
  expect(parsedData.availability.Monday['4p']).toBe(false)
  expect(parsedData.availability.Monday['5p']).toBe(false)
  expect(parsedData.availability.Monday['6p']).toBe(false)
  expect(parsedData.availability.Monday['7p']).toBe(false)
  expect(parsedData.availability.Monday['8p']).toBe(false)
  expect(parsedData.availability.Monday['9p']).toBe(false)
  expect(parsedData.availability.Monday['10p']).toBe(false)
  expect(parsedData.availability.Monday['11p']).toBe(false)

  expect(parsedData.availability.Tuesday['12a']).toBe(false)
  expect(parsedData.availability.Tuesday['1a']).toBe(false)
  expect(parsedData.availability.Tuesday['2a']).toBe(false)
  expect(parsedData.availability.Tuesday['3a']).toBe(false)
  expect(parsedData.availability.Tuesday['4a']).toBe(false)
  expect(parsedData.availability.Tuesday['5a']).toBe(false)
  expect(parsedData.availability.Tuesday['6a']).toBe(false)
  expect(parsedData.availability.Tuesday['7a']).toBe(false)
  expect(parsedData.availability.Tuesday['8a']).toBe(false)
  expect(parsedData.availability.Tuesday['9a']).toBe(false)
  expect(parsedData.availability.Tuesday['10a']).toBe(false)
  expect(parsedData.availability.Tuesday['11a']).toBe(false)
  expect(parsedData.availability.Tuesday['12p']).toBe(false)
  expect(parsedData.availability.Tuesday['1p']).toBe(false)
  expect(parsedData.availability.Tuesday['2p']).toBe(false)
  expect(parsedData.availability.Tuesday['3p']).toBe(false)
  expect(parsedData.availability.Tuesday['4p']).toBe(false)
  expect(parsedData.availability.Tuesday['5p']).toBe(false)
  expect(parsedData.availability.Tuesday['6p']).toBe(false)
  expect(parsedData.availability.Tuesday['7p']).toBe(false)
  expect(parsedData.availability.Tuesday['8p']).toBe(false)
  expect(parsedData.availability.Tuesday['9p']).toBe(false)
  expect(parsedData.availability.Tuesday['10p']).toBe(false)
  expect(parsedData.availability.Tuesday['11p']).toBe(false)

  expect(parsedData.availability.Wednesday['12a']).toBe(false)
  expect(parsedData.availability.Wednesday['1a']).toBe(false)
  expect(parsedData.availability.Wednesday['2a']).toBe(false)
  expect(parsedData.availability.Wednesday['3a']).toBe(false)
  expect(parsedData.availability.Wednesday['4a']).toBe(false)
  expect(parsedData.availability.Wednesday['5a']).toBe(false)
  expect(parsedData.availability.Wednesday['6a']).toBe(false)
  expect(parsedData.availability.Wednesday['7a']).toBe(false)
  expect(parsedData.availability.Wednesday['8a']).toBe(false)
  expect(parsedData.availability.Wednesday['9a']).toBe(false)
  expect(parsedData.availability.Wednesday['10a']).toBe(false)
  expect(parsedData.availability.Wednesday['11a']).toBe(false)
  expect(parsedData.availability.Wednesday['12p']).toBe(false)
  expect(parsedData.availability.Wednesday['1p']).toBe(false)
  expect(parsedData.availability.Wednesday['2p']).toBe(false)
  expect(parsedData.availability.Wednesday['3p']).toBe(false)
  expect(parsedData.availability.Wednesday['4p']).toBe(false)
  expect(parsedData.availability.Wednesday['5p']).toBe(false)
  expect(parsedData.availability.Wednesday['6p']).toBe(false)
  expect(parsedData.availability.Wednesday['7p']).toBe(false)
  expect(parsedData.availability.Wednesday['8p']).toBe(false)
  expect(parsedData.availability.Wednesday['9p']).toBe(false)
  expect(parsedData.availability.Wednesday['10p']).toBe(false)
  expect(parsedData.availability.Wednesday['11p']).toBe(false)

  expect(parsedData.availability.Thursday['12a']).toBe(false)
  expect(parsedData.availability.Thursday['1a']).toBe(false)
  expect(parsedData.availability.Thursday['2a']).toBe(false)
  expect(parsedData.availability.Thursday['3a']).toBe(false)
  expect(parsedData.availability.Thursday['4a']).toBe(false)
  expect(parsedData.availability.Thursday['5a']).toBe(false)
  expect(parsedData.availability.Thursday['6a']).toBe(false)
  expect(parsedData.availability.Thursday['7a']).toBe(false)
  expect(parsedData.availability.Thursday['8a']).toBe(false)
  expect(parsedData.availability.Thursday['9a']).toBe(false)
  expect(parsedData.availability.Thursday['10a']).toBe(false)
  expect(parsedData.availability.Thursday['11a']).toBe(false)
  expect(parsedData.availability.Thursday['12p']).toBe(false)
  expect(parsedData.availability.Thursday['1p']).toBe(false)
  expect(parsedData.availability.Thursday['2p']).toBe(false)
  expect(parsedData.availability.Thursday['3p']).toBe(false)
  expect(parsedData.availability.Thursday['4p']).toBe(false)
  expect(parsedData.availability.Thursday['5p']).toBe(false)
  expect(parsedData.availability.Thursday['6p']).toBe(false)
  expect(parsedData.availability.Thursday['7p']).toBe(false)
  expect(parsedData.availability.Thursday['8p']).toBe(false)
  expect(parsedData.availability.Thursday['9p']).toBe(false)
  expect(parsedData.availability.Thursday['10p']).toBe(false)
  expect(parsedData.availability.Thursday['11p']).toBe(false)

  expect(parsedData.availability.Friday['12a']).toBe(false)
  expect(parsedData.availability.Friday['1a']).toBe(false)
  expect(parsedData.availability.Friday['2a']).toBe(false)
  expect(parsedData.availability.Friday['3a']).toBe(false)
  expect(parsedData.availability.Friday['4a']).toBe(false)
  expect(parsedData.availability.Friday['5a']).toBe(false)
  expect(parsedData.availability.Friday['6a']).toBe(false)
  expect(parsedData.availability.Friday['7a']).toBe(false)
  expect(parsedData.availability.Friday['8a']).toBe(false)
  expect(parsedData.availability.Friday['9a']).toBe(false)
  expect(parsedData.availability.Friday['10a']).toBe(false)
  expect(parsedData.availability.Friday['11a']).toBe(false)
  expect(parsedData.availability.Friday['12p']).toBe(false)
  expect(parsedData.availability.Friday['1p']).toBe(false)
  expect(parsedData.availability.Friday['2p']).toBe(false)
  expect(parsedData.availability.Friday['3p']).toBe(false)
  expect(parsedData.availability.Friday['4p']).toBe(false)
  expect(parsedData.availability.Friday['5p']).toBe(false)
  expect(parsedData.availability.Friday['6p']).toBe(false)
  expect(parsedData.availability.Friday['7p']).toBe(false)
  expect(parsedData.availability.Friday['8p']).toBe(false)
  expect(parsedData.availability.Friday['9p']).toBe(false)
  expect(parsedData.availability.Friday['10p']).toBe(false)
  expect(parsedData.availability.Friday['11p']).toBe(false)

  expect(parsedData.availability.Saturday['12a']).toBe(true)
  expect(parsedData.availability.Saturday['1a']).toBe(true)
  expect(parsedData.availability.Saturday['2a']).toBe(true)
  expect(parsedData.availability.Saturday['3a']).toBe(true)
  expect(parsedData.availability.Saturday['4a']).toBe(true)
  expect(parsedData.availability.Saturday['5a']).toBe(true)
  expect(parsedData.availability.Saturday['6a']).toBe(true)
  expect(parsedData.availability.Saturday['7a']).toBe(true)
  expect(parsedData.availability.Saturday['8a']).toBe(true)
  expect(parsedData.availability.Saturday['9a']).toBe(true)
  expect(parsedData.availability.Saturday['10a']).toBe(true)
  expect(parsedData.availability.Saturday['11a']).toBe(true)
  expect(parsedData.availability.Saturday['12p']).toBe(true)
  expect(parsedData.availability.Saturday['1p']).toBe(true)
  expect(parsedData.availability.Saturday['2p']).toBe(true)
  expect(parsedData.availability.Saturday['3p']).toBe(true)
  expect(parsedData.availability.Saturday['4p']).toBe(true)
  expect(parsedData.availability.Saturday['5p']).toBe(true)
  expect(parsedData.availability.Saturday['6p']).toBe(true)
  expect(parsedData.availability.Saturday['7p']).toBe(true)
  expect(parsedData.availability.Saturday['8p']).toBe(true)
  expect(parsedData.availability.Saturday['9p']).toBe(true)
  expect(parsedData.availability.Saturday['10p']).toBe(true)
  expect(parsedData.availability.Saturday['11p']).toBe(true)
  expect(parsedData.timezone).toBe('EST')
  expect(parsedData.college).toBe('college')
  expect(parsedData.favoriteAcademicSubject).toBe('favoriteAcademicSubject')
  expect(parsedData.isFakeUser).toBe(false)
  expect(parsedData.password).toBe(undefined)
  expect(parsedData.certifications['prealgebra'].passed).toBe(false)
  expect(parsedData.certifications['algebra'].passed).toBe(false)
  expect(parsedData.certifications['geometry'].passed).toBe(false)
  expect(parsedData.certifications['trigonometry'].passed).toBe(false)
  expect(parsedData.certifications['precalculus'].passed).toBe(false)
  expect(parsedData.certifications['calculus'].passed).toBe(false)
  expect(parsedData.certifications['applications'].passed).toBe(false)
  expect(parsedData.certifications['essays'].passed).toBe(false)
  expect(parsedData.certifications['planning'].passed).toBe(false)
  expect(parsedData.certifications['biology'].passed).toBe(false)
  expect(parsedData.certifications['prealgebra'].tries).toBe(0)
  expect(parsedData.certifications['algebra'].tries).toBe(0)
  expect(parsedData.certifications['geometry'].tries).toBe(0)
  expect(parsedData.certifications['trigonometry'].tries).toBe(0)
  expect(parsedData.certifications['precalculus'].tries).toBe(0)
  expect(parsedData.certifications['calculus'].tries).toBe(0)
  expect(parsedData.certifications['applications'].tries).toBe(0)
  expect(parsedData.certifications['essays'].tries).toBe(0)
  expect(parsedData.certifications['planning'].tries).toBe(0)
  expect(parsedData.certifications['biology'].passed).toBe(false)
})

test('Phone does not match format', () => {
  goodUser.phonePretty = '222222222'
  const test = goodUser.phonePretty
  expect(test).toBe(null)
})

test('Phone format matches', () => {
  goodUser.phonePretty = '555-555-5555'
  expect(goodUser.phonePretty).toBe('555-555-5555')
})

test('Setting phone to null', () => {
  goodUser.phone = null
  expect(goodUser.phonePretty).toBe(null)
})

test('Test international phone number', () => {
  goodUser.phone = '+123456790'
  const tempPhone = goodUser.phonePretty
  expect(tempPhone).toBe('+123456790')
})

test('Elapsed availability for partially onboarded users', async () => {
  // EST Time Zone for dates
  const lastModifiedDate = '2020-02-06T00:52:59.538-05:00'
  const newModifiedDate = '2020-02-09T12:40:00.000-05:00'
  const expected = 0
  goodUser.availability = flexibleHoursSelected
  goodUser.availabilityLastModifiedAt = lastModifiedDate
  const result = goodUser.calculateElapsedAvailability(newModifiedDate)
  expect(expected).toBe(result)
})

test('Elapsed availability over 3 days with no hours available', () => {
  // EST Time Zone for dates
  const lastModifiedDate = '2020-02-06T12:52:59.538-05:00'
  const newModifiedDate = '2020-02-09T13:40:00.000-05:00'
  const expected = 0
  goodUser.availability = noHoursSelected
  goodUser.availabilityLastModifiedAt = lastModifiedDate
  const result = goodUser.calculateElapsedAvailability(newModifiedDate)
  expect(expected).toBe(result)
})

test('Elapsed availability over 3 days with all hours available and 7 hours out of range', async () => {
  // EST Time Zone for dates
  const lastModifiedDate = '2020-02-06T00:52:59.538-05:00'
  const newModifiedDate = '2020-02-09T19:40:00.000-05:00'
  const expected = 90
  goodUser.availability = allHoursSelected
  goodUser.availabilityLastModifiedAt = lastModifiedDate
  // @todo Make Volunteer.test.js with an onboarded and partially onboarded Volunteer
  // Onboard the user
  goodUser.isVolunteer = true
  goodUser.certifications['algebra'].passed = true
  const result = goodUser.calculateElapsedAvailability(newModifiedDate)
  expect(expected).toBe(result)

  // set user back to default
  goodUser.isVolunteer = false
  goodUser.certifications['algebra'].passed = false
})

test('Elapsed availability over 3 days with flexible hours available', async () => {
  // EST Time Zone for dates
  const lastModifiedDate = '2020-02-06T00:52:59.538-05:00'
  const newModifiedDate = '2020-02-09T12:40:00.000-05:00'
  const expected = 16
  goodUser.availability = flexibleHoursSelected
  goodUser.availabilityLastModifiedAt = lastModifiedDate
  // @todo Make Volunteer.test.js with an onboarded and partially onboarded Volunteer
  // Onboard the user
  goodUser.isVolunteer = true
  goodUser.certifications['algebra'].passed = true
  const result = goodUser.calculateElapsedAvailability(newModifiedDate)
  expect(expected).toBe(result)

  // set user back to default
  goodUser.isVolunteer = false
  goodUser.certifications['algebra'].passed = false
})

/** 
 * flexibleHoursSelected mapped:
 { Sunday: 3,
  Monday: 6,
  Tuesday: 6,
  Wednesday: 5,
  Thursday: 3,
  Friday: 6,
  Saturday: 5 }
**/
test('Elapsed availability over 23 days with flexible hours available', async () => {
  // EST Time Zone for dates
  const lastModifiedDate = '2020-02-02T05:21:39.538-05:00'
  const newModifiedDate = '2020-02-25T16:20:42.000-05:00'
  const expected = 114
  goodUser.availability = flexibleHoursSelected
  goodUser.availabilityLastModifiedAt = lastModifiedDate

  // @todo Make Volunteer.test.js with an onboarded and partially onboarded Volunteer
  // Onboard the user
  goodUser.isVolunteer = true
  goodUser.certifications['algebra'].passed = true
  const result = goodUser.calculateElapsedAvailability(newModifiedDate)
  expect(expected).toBe(result)

  // set user back to default
  goodUser.isVolunteer = false
  goodUser.certifications['algebra'].passed = false
})
