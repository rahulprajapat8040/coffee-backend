import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { OfferTargetType } from '../../../lib/utils/enums/enum.js';
import { CommonQueryDTO } from '../../../lib/utils/dto/common-query.dto.js';

export class OfferDTO {
  @ApiProperty({ example: 'Afternoon pick-me-up' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({ example: 'Save on your next coffee.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @ApiPropertyOptional({ example: '/uploads/offer.webp' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  image?: string | null;

  @ApiProperty({ enum: OfferTargetType })
  @IsEnum(OfferTargetType)
  targetType: OfferTargetType;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  coffeeIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds?: string[];

  @ApiProperty({ example: 15, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(100)
  discountPercentage: number;

  @ApiProperty({ example: '2026-11-22T09:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2026-12-01T23:59:00.000Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string | null;
}

export class OfferQueryDTO extends CommonQueryDTO {
  @ApiPropertyOptional({ example: 'afternoon' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}

export class OfferStatusDTO {
  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;
}
