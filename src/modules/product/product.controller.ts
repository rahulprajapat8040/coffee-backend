import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ProductService } from "./product.service.js";
import { CategoryDTO } from "./dto/category.dto.js";
import { CommonQueryDTO } from "../../utils/dto/common-query.dto.js";
import { CoffeeDTO } from "./dto/coffee.dto.js";
import { CoffeeQueryDTO } from "./dto/product-query.dto.js";

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('category')
  createCategory(@Body() dto: CategoryDTO) {
    return this.productService.createCategory(dto);
  }

  @Get('category')
  getAllCategories(@Query() query: CommonQueryDTO) {
    return this.productService.getAllCategories(query);
  }

  @Post('coffee')
  createCoffee(@Body() dto: CoffeeDTO) {
    return this.productService.createCoffee(dto);
  }

  @Get('coffee')
  getAllCoffees(@Query() query: CoffeeQueryDTO) {
    return this.productService.getAllCoffees(query);
  }
}