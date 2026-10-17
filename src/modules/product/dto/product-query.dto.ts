import { ApiPropertyOptional } from "@nestjs/swagger";
import { CommonQueryDTO } from "../../../utils/dto/common-query.dto.js";
import { IsOptional } from "class-validator";

export class CoffeeQueryDTO extends CommonQueryDTO {
  @ApiPropertyOptional({
    example: 'category-id-uuid',
    description: 'Category id',
  })
  @IsOptional()
  categoryId: string;
}