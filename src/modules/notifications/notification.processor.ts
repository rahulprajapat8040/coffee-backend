import { Processor, WorkerHost } from '@nestjs/bullmq';
import { NOTIFICATION_JOB_NAMES, NOTIFICATION_QUEUE } from '../../lib/utils/constant/notification.constants.js';
import { FirebaseService } from './firebase/firebase.service.js';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);
  constructor(private readonly firebaseService: FirebaseService) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
      case NOTIFICATION_JOB_NAMES.SEND_TO_USER:
        this.firebaseService.sendToUser(job.data.userId, job.data.notification);
        this.logger.log('Sending to user');
        break;
    }
  }
}
