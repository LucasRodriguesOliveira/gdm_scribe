import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { LoginProxy } from '../../../usecase-proxy/auth/login.proxy';
import { LoginUseCase } from '../../../../application/usecase/auth/login.usecase';
import { IHttpExceptionService } from '../../../../domain/exception/http-exception.interface';
import { ILoggerService } from '../../../../domain/logger/logger-service.interface';
import { UserModel } from '../../../../domain/model/user.model';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(LoginProxy.Token)
    private readonly loginUseCase: LoginUseCase,
    private readonly exceptionService: IHttpExceptionService,
    private readonly loggerService: ILoggerService,
  ) {
    super({
      usernameField: 'email',
    });
  }

  public async validate(email: string, password: string): Promise<UserModel> {
    if (!email || !password) {
      this.loggerService.warn(LocalStrategy.name, 'Email or password missing');
      this.exceptionService.unauthorized({
        message: 'Invalid credentials',
      });
    }

    return this.loginUseCase.checkUser(email, password);
  }
}
