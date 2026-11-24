import { Inject, Injectable, Logger } from '@nestjs/common';
import { FIREBASE_MESSAGING } from './firebase.provider.js';
import { Messaging } from 'firebase-admin/messaging';
import { InjectModel } from '@nestjs/sequelize';
import { DeviceInfo, User } from '../../database/models/index.js';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  constructor(
    @Inject(FIREBASE_MESSAGING) private readonly messaing: Messaging,
    @InjectModel(User) private readonly userModel: User,
    @InjectModel(DeviceInfo)
    private readonly deviceInfoModel: typeof DeviceInfo,
  ) {}

  async sendToUser(
    userId: string,
    notification: {
      title: string;
      body: string;
      data?: Record<string, string>;
    },
  ) {
    const devices = await this.deviceInfoModel.findAll({
      where: { userId: userId },
      attributes: ['id', 'deviceToken'],
    });

    const validDevices = devices.filter((device) => !!device.deviceToken);

    if (!validDevices.length) {
      this.logger.debug(`No valid devices found for user ${userId}`);
      return;
    }

    this.logger.log(`Total devices found ${validDevices.length}`);

    const chunks = this.chunk(devices, 500);

    let totalSuccess = 0;
    let totalFailure = 0;

    for (const [chunkIndex, chunk] of chunks.entries()) {
      const messages = chunk.map((device) => ({
        token: device.deviceToken!,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: this.normalizeData(notification.data),
      }));

      try {
        const response = await this.messaing.sendEach(messages);

        const invalidDeviceIds: string[] = [];

        response.responses.forEach((result, index) => {
          const device = chunk[index];

          if (result.success) {
            totalSuccess++;
            this.logger.debug(
              `Notification sent successfully to device ${device.id}`,
            );
            return;
          }

          totalFailure++;
          const errorCode = result.error?.code;
          this.logger.error(
            `Notification failed for device ${device.id}: ${errorCode} - ${result.error?.message}`,
          );

          if (
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered'
          ) {
            invalidDeviceIds.push(device.id);
          }
        });

        if (invalidDeviceIds.length) {
          await this.deviceInfoModel.update(
            { deviceToken: null },
            { where: { id: invalidDeviceIds } },
          );

          this.logger.warn(
            `Removed ${invalidDeviceIds.length} invalid device tokens`,
          );
        }

        this.logger.log(
          `Notification batch ${chunkIndex + 1}/${chunks.length} completed: ${response.successCount} succeeded`,
        );
      } catch (error) {
        totalFailure += chunk.length;
        this.logger.error(
          `Notification batch ${chunkIndex + 1} failed`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
    this.logger.log(
      `Notification delivery finished for usre ${userId}. Success ${totalSuccess}, Failure ${totalFailure}`,
    );

    return {
      totalDevices: validDevices.length,
      successCount: totalSuccess,
      failureCount: totalFailure,
    };
  }

  private normalizeData(data?: Record<string, string>): Record<string, string> {
    if (!data) return {};

    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, String(value)]),
    );
  }

  private chunk<T>(array: T[], size: number) {
    const chunks: T[][] = [];

    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }

    return chunks;
  }
}
