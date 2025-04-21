import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { CreateUserPresenter } from '../../user/presenter/create-user.presenter';

export class LoginPresenter {
  @Expose()
  @ApiProperty({
    type: CreateUserPresenter,
  })
  user: CreateUserPresenter;

  @Expose()
  @ApiProperty({
    type: String,
  })
  token: string;
}
