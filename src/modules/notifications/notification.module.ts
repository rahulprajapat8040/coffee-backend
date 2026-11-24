import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NOTIFICATION_QUEUE } from '../../lib/utils/constant/notification.constants.js';
import { FirebaseProvider } from './firebase/firebase.provider.js';
import { FirebaseService } from './firebase/firebase.service.js';

@Module({
  imports: [BullModule.registerQueue({ name: NOTIFICATION_QUEUE })],
  providers: [FirebaseProvider, FirebaseService],
})
export class NotificationModule {}
