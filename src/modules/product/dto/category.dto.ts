import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CategoryDTO {
  @ApiProperty({ example: 'Matcha', description: 'category name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Matcha is a very good coffee',
    description: 'Category description',
  })
  @IsOptional()
  description: string;

  @ApiPropertyOptional({ example: '/uploads/img/cat.1.png' })
  @IsOptional()
  image: string;
}