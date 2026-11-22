import { Role } from '../utils/enums/enum.js';

export interface IJwtPayload {
  userId: string;
  deviceId: string;
}

export interface IAuthUser {
  id: string;
  deviceId: string;
  role: Role;
}
