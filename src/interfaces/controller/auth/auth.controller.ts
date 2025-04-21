import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { LoginProxy } from '../../../infrastructure/usecase-proxy/auth/login.proxy';
import { LoginUseCase } from '../../../application/usecase/auth/login.usecase';
import { CreateUserProxy } from '../../../infrastructure/usecase-proxy/user/create-user.proxy';
import { CreateUserUseCase } from '../../../application/usecase/user/create-user.usecase';
import { LocalGuard } from '../../../infrastructure/common/guard/local.guard';
import { LoginPresenter } from './presenter/login.presenter';
import { Request as IRequest } from 'express';
import { plainToInstance } from 'class-transformer';
import { FindUserPresenter } from '../user/presenter/find-user.presenter';
import { RegisterPresenter } from './presenter/register.presenter';
import { PresenterInterceptor } from '../../../infrastructure/common/interceptor/presenter.interceptor';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { CreateUserPresenter } from '../user/presenter/create-user.presenter';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    @Inject(LoginProxy.Token)
    private readonly loginUseCase: LoginUseCase,
    @Inject(CreateUserProxy.Token)
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(LocalGuard)
  @ApiOkResponse({
    type: LoginPresenter,
  })
  public async login(@Request() req: IRequest): Promise<LoginPresenter> {
    const token = await this.loginUseCase.login(req.user);

    return {
      token,
      user: plainToInstance(FindUserPresenter, req.user),
    };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  @ApiCreatedResponse({
    type: RegisterPresenter,
  })
  @UseInterceptors(new PresenterInterceptor(RegisterPresenter))
  public async register(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    const user = await this.createUserUseCase.run(createUserDto);
    const token = await this.loginUseCase.login(user);

    return {
      user: plainToInstance(CreateUserPresenter, user),
      token,
    };
  }
}
