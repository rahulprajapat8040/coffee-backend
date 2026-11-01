import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsDecimal, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { VariantStatus } from "../../../utils/enums/enum.js";

export class CoffeeVariantDTO {
  @ApiProperty({ example: 'M', description: 'Size or name of coffe' })
  @IsNotEmpty()
  @IsString()
  size: string;

  @ApiProperty({ example: '10.200', description: 'Price of coffee' })
  @IsNotEmpty()
  @IsDecimal()
  price: string;
}

export class CoffeeDTO {
  @ApiProperty({ example: 'Espresso', description: 'Name of the coffe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Esspresso is very good coffee',
    description: 'Description about the coffe',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({
    example: 'uploads/img.png',
    description: 'Image of the coffee',
  })
  @IsOptional()
  image: string;

  @ApiProperty({ example: 'category-id-uuid', description: 'category id' })
  @IsNotEmpty()
  @IsUUID('4')
  categoryId: string;

  @ApiProperty({ type: [CoffeeVariantDTO] })
  @IsNotEmpty()
  @IsArray()
  variants: CoffeeVariantDTO[];
}

export class CoffeeStatusUpdateDTO {
  @ApiProperty({
    example: true,
    description: 'status of the coffee',
  })
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}

export class VariantStatusUpdateDTO {
  @ApiProperty({
    example: VariantStatus.UN_AVAILABLE,
    description: 'status of the variant',
    enum: VariantStatus,
  })
  @IsNotEmpty()
  @IsEnum(VariantStatus)
  status: VariantStatus;
}