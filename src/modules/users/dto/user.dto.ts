import { ApiProperty } from "@nestjs/swagger";
import { IsLatitude, IsLongitude, IsNotEmpty, IsString } from "class-validator";

export class AddressDTO {
  @ApiProperty({
    example: 'home address location 123',
    description: 'user address',
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    example: 2323.232,
    description: 'latitude of the user location',
  })
  @IsNotEmpty()
  @IsLatitude()
  latitude: number;

  @ApiProperty({
    example: 2323.232,
    description: 'Longitude of the user location',
  })
  @IsNotEmpty()
  @IsLongitude()
  longitude: number;
}