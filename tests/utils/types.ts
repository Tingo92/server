// @todo: clean up - use the Student interface from Student.ts when available
export interface Student {
  email: string;
  // optional use for building registration form
  firstName?: string;
  lastName?: string;
  firstname: string;
  lastname: string;
  highSchoolId: string;
  password: string;
  zipCode: string;
  studentPartnerOrg: string;
  referredByCode: string;
}

// @todo: clean up - use the Volunteer interface from Volunteer.ts when available
export interface Volunteer {
  email: string;
  // optional use for building registration form
  firstName?: string;
  lastName?: string;
  firstname: string;
  lastname: string;
  password: string;
  zipCode: string;
  college: string;
  volunteerPartnerOrg?: string;
  favoriteAcademicSubject: string;
  referredByCode: string;
  phone: string;
}

export interface StudentRegistrationForm extends Student {
  terms: boolean;
}

export interface VolunteerRegistrationForm extends Volunteer {
  terms: boolean;
}
