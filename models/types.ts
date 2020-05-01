import { Document } from 'mongoose';

interface Certification {
  passed: boolean;
  tries: number;
}

export interface User extends Document {
  calculateElapsedAvailability: (Date) => number;
  availabilityLastModifiedAt: Date;
  elapsedAvailability: number;
  createdAt: Date;
  firstname: string;
  email: string;
  certifications: {
    [key: string]: Certification;
  };
}
