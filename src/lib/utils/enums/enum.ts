export enum DeviceType {
  IOS = 'IOS',
  ANDORID = 'ANDROID',
  WEB = 'WEB',
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum VariantStatus {
  AVAILABLE = 'AVAILABLE',
  UN_AVAILABLE = 'UN_AVAILABLE',
}

export enum OrderStatus {
  PREPARING = 'PREPARING',
  ON_THE_WAY = 'ON_THE_WAY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}

export enum OfferTargetType {
  ALL_PRODUCTS = 'ALL_PRODUCTS',
  SELECTED_COFFEES = 'SELECTED_COFFEES',
  SELECTED_CATEGORIES = 'SELECTED_CATEGORIES',
}

export enum NotificationType {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_STATUS_UPDATE = 'ORDER_STATUS_UPDATE',
}