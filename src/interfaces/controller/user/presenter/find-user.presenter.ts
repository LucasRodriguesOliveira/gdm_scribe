import { Exclude, Expose } from 'class-transformer';
import { UserModel } from '../../../../domain/model/user.model';
import { ApiProperty } from '@nestjs/swagger';
import { fakerPT_BR } from '@faker-js/faker';

@Exclude()
export class FindUserPresenter extends UserModel {
  @Expose()
  @ApiProperty({
    type: String,
    example: fakerPT_BR.string.uuid(),
  })
  id: string;

  @Expose()
  @ApiProperty({
    type: String,
    example: fakerPT_BR.person.fullName(),
  })
  name: string;

  @Expose()
  @ApiProperty({
    type: String,
    example: fakerPT_BR.internet.email(),
  })
  email: string;

  @Expose()
  @ApiProperty({
    type: Date,
    example: fakerPT_BR.date.anytime(),
  })
  createdAt: Date;
}
