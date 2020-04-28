import { ProcessPromiseFunction, Queue } from 'bull';
import { log } from '../logger';
import { map } from 'lodash';
import updateElapsedAvailability from './updateElapsedAvailability';
import sendFinishOnboardingEmail from './sendFinishOnboardingEmail';

export enum Jobs {
  UpdateElapsedAvailability = 'UpdateElapsedAvailability',
  SendFinishOnboardingEmail = 'SendFinishOnboardingEmail'
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
    name: Jobs.SendFinishOnboardingEmail,
    processor: sendFinishOnboardingEmail
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
