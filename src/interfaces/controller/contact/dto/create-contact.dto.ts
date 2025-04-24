import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateContactDto {
  @ApiProperty({
    type: String,
    required: true,
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    type: String,
    required: true,
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  phone: string;

  @ApiProperty({
    type: String,
    required: true,
    minLength: 2,
    maxLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(2)
  state: string;
}
