export type NotificationChannel = 'email' | 'whatsapp';

export type HotDealAlertPreference = {
  channel: NotificationChannel;
  enabled: boolean;
};

