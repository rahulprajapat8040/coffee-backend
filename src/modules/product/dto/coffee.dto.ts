import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

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
}