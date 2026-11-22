import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { OrderStatus } from '../../../lib/utils/enums/enum.js';

export class CreateOrderDTO {
  @ApiProperty({ description: 'Saved delivery address id' })
  @IsNotEmpty()
  @IsUUID('4')
  addressId: string;

  @ApiPropertyOptional({ description: 'Delivery instructions' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}

export class UpdateOrderStatusDTO {
  @ApiProperty({ enum: OrderStatus })
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
