import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NOTIFICATION_QUEUE } from '../../lib/utils/constant/notification.constants.js';
import { FirebaseProvider } from './firebase/firebase.provider.js';
import { FirebaseService } from './firebase/firebase.service.js';
import { NotificationProcessor } from './notification.processor.js';
import { NotificationService } from './notification.service.js';

@Module({
  imports: [BullModule.registerQueue({ name: NOTIFICATION_QUEUE })],
  providers: [
    FirebaseProvider,
    FirebaseService,
    NotificationProcessor,
    NotificationService,
  ],
})
export class NotificationModule {}
