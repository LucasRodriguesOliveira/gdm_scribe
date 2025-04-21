import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class QueryContactDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  state?: string;
}
