import { ProcessPromiseFunction, Queue } from 'bull';
import { log } from '../logger';
import { map } from 'lodash';
import updateElapsedAvailability from './updateElapsedAvailability';
import sendStudentTryUsEmail from './sendStudentTryUsEmail';

export enum Jobs {
  UpdateElapsedAvailability = 'UpdateElapsedAvailability',
  SendStudentTryUsEmail = 'SendStudentTryUsEmail'
}

// register new job processors here
interface JobProcessor {
  name: Jobs;
  processor: ProcessPromiseFunction<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const jobProcessors: JobProcessor[] = [
  {
    name: Jobs.UpdateElapsedAvailability,
    processor: updateElapsedAvailability
  },
  {
    name: Jobs.SendStudentTryUsEmail,
    processor: sendStudentTryUsEmail
  }
];

export const addJobProcessors = (queue: Queue): void => {
  map(jobProcessors, jobProcessor =>
    queue.process(jobProcessor.name, async job => {
      log(`Processing job: ${job.name}`);
      await jobProcessor.processor(job);
      log(`Completed job: ${job.name}`);
    })
  );
};
