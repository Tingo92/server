import { Student } from '../../models/Student';
import { Volunteer } from '../../models/Volunteer';

export interface StudentRegistrationForm extends Student {
  terms: boolean;
}

export interface VolunteerRegistrationForm extends Volunteer {
  terms: boolean;
}
