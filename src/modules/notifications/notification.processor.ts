import { Processor, WorkerHost } from '@nestjs/bullmq';
import { NOTIFICATION_QUEUE } from '../../lib/utils/constant/notification.constants.js';
import { FirebaseService } from './firebase/firebase.service.js';
import { Job } from 'bullmq';

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  constructor(private readonly firebaseService: FirebaseService) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
    }
  }
}
