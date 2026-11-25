import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { NOTIFICATION_JOB_NAMES, NOTIFICATION_QUEUE } from "../../lib/utils/constant/notification.constants.js";
import { Queue } from "bullmq";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(
    @InjectQueue(NOTIFICATION_QUEUE) private readonly notificationQueue: Queue,
  ) {}

  async sendToUser() {
    await this.notificationQueue.add(NOTIFICATION_JOB_NAMES.SEND_TO_USER, {});
  }
}