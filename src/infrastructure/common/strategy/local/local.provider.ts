import { Provider } from '@nestjs/common';
import { LoginProxy } from '../../../usecase-proxy/auth/login.proxy';
import { HttpExceptionService } from '../../../http-exception/http-exception.service';
import { LoggerService } from '../../../logger/logger.service';
import { LocalStrategy } from './local.strategy';
import { LoginUseCase } from '../../../../application/usecase/auth/login.usecase';
import { IHttpExceptionService } from '../../../../domain/exception/http-exception.interface';
import { ILoggerService } from '../../../../domain/logger/logger-service.interface';

export const LocalStrategyProvider: Provider = {
  provide: LocalStrategy,
  inject: [LoginProxy.Token, HttpExceptionService, LoggerService],
  useFactory: (
    loginUseCase: LoginUseCase,
    exceptionService: IHttpExceptionService,
    loggerService: ILoggerService,
  ) => new LocalStrategy(loginUseCase, exceptionService, loggerService),
};
