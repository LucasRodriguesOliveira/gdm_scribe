import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FindUserByIdProxy } from '../../../infrastructure/usecase-proxy/user/find-user-by-id.proxy';
import { FindUserByIdUseCase } from '../../../application/usecase/user/find-user-by-id.usecase';
import { FindUserPresenter } from './presenter/find-user.presenter';
import { PresenterInterceptor } from '../../../infrastructure/common/interceptor/presenter.interceptor';
import { JwtGuard } from '../../../infrastructure/common/guard/jwt.guard';
import { GetUser } from '../../../infrastructure/common/decorator/get-user.decorator';
import { UserModel } from '../../../domain/model/user.model';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(
    @Inject(FindUserByIdProxy.Token)
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: FindUserPresenter,
  })
  @ApiBearerAuth()
  @UseInterceptors(new PresenterInterceptor(FindUserPresenter))
  @UseGuards(JwtGuard)
  public async find(@GetUser() user: UserModel): Promise<UserModel> {
    return user;
  }
}
