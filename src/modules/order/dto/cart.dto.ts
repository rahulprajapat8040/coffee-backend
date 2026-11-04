import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from "class-validator";

export class CartDTO {
  @ApiProperty({ example: 'coffee-id uuid', description: 'coffee id' })
  @IsNotEmpty()
  @IsUUID('4')
  coffeeId: string;

  @ApiProperty({ example: 'variant-id uuid', description: 'variant id' })
  @IsNotEmpty()
  @IsUUID('4')
  variantId: string;

  @ApiProperty({ example: 2, description: 'selected quantity' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class QuantityDTO {
  @ApiProperty({ example: 2, description: 'quantity of the item' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 'asc', description: 'type of the increment' })
  @IsNotEmpty()
  @IsString()
  type: 'asc' | 'desc';
}