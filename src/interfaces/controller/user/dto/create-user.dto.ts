import { fakerPT_BR } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  @ApiProperty({
    type: String,
    example: fakerPT_BR.person.fullName(),
    required: true,
    minLength: 3,
    maxLength: 100,
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  @IsEmail()
  @ApiProperty({
    type: String,
    example: fakerPT_BR.internet.email(),
    required: true,
    minLength: 3,
    maxLength: 150,
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  @ApiProperty({
    type: String,
    example: fakerPT_BR.internet.password({ length: 10 }),
    required: true,
    minLength: 3,
    maxLength: 150,
  })
  password: string;
}
