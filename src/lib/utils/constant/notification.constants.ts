export const NOTIFICATION_QUEUE = 'caffino-dev-notifications';

export const NotificationJob = {
  SEND_PUSH: 'send-push',
} as const;

export const NOTIFICATION_JOB_NAMES = {
  SEND_TO_USER: 'send-notification-to-user',
  SEND_TO_ALL: 'send-notification-to-all',
  SEND_TO_ADMIN: 'send-notification-to-admin',
};