import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class NotificationDTO {
  @ApiProperty({ example: 'Your order is confirmed' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Dear user your order is confirmed' })
  @IsNotEmpty()
  @IsString()
  body: string;

  @ApiProperty({
    example: { orderId: 'odr-122' },
    description: 'additional data',
  })
  @IsOptional()
  data: object;
}

export class SendToUser {}