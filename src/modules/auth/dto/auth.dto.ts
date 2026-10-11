import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
} from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DeviceType } from '../../../utils/enums/enum.js';

export class DeviceDTO {
  @ApiProperty({ example: '232-daa-device', description: 'Device id' })
  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @ApiPropertyOptional({
    example: 'device-fcm-token',
    description: 'Device fcm token for notification',
  })
  @IsOptional()
  deviceToken: string;

  @ApiProperty({
    example: DeviceType.ANDORID,
    description: 'Device type',
    enum: DeviceType,
  })
  @IsNotEmpty()
  @IsEnum(DeviceType)
  deviceType: DeviceType;
}

export class OTPReqDTO {
  @ApiProperty({ example: 'test@gmail.com', description: 'email of the user' })
  @IsNotEmpty()
  @IsString()
  email: string;
}

export class SignupDTO extends IntersectionType(DeviceDTO, OTPReqDTO) {
  @ApiProperty({ example: 'Rahul', description: 'first name of user' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'prajapat', description: 'last name of the user' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: '123456', description: 'OTP' })
  @IsNotEmpty()
  @IsString()
  otp: string;
}

export class LoginDTO extends IntersectionType(DeviceDTO, OTPReqDTO) {
  @ApiProperty({ example: '123456', description: 'OTP' })
  @IsNotEmpty()
  @IsString()
  otp: string;
}