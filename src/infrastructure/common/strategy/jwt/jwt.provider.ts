import { Provider } from '@nestjs/common';
import { FindUserByEmailProxy } from '../../../usecase-proxy/user/find-user-by-email.proxy';
import { LoggerService } from '../../../logger/logger.service';
import { HttpExceptionService } from '../../../http-exception/http-exception.service';
import { JwtStrategy } from './jwt.strategy';
import { FindUserByEmailUseCase } from '../../../../application/usecase/user/find-user-by-email.usecase';
import { ConfigService } from '@nestjs/config';
import { ILoggerService } from '../../../../domain/logger/logger-service.interface';
import { IHttpExceptionService } from '../../../../domain/exception/http-exception.interface';

export const JwtStrategyProvider: Provider = {
  inject: [
    FindUserByEmailProxy.Token,
    ConfigService,
    LoggerService,
    HttpExceptionService,
  ],
  provide: JwtStrategy,
  useFactory: (
    findUserByEmailUseCase: FindUserByEmailUseCase,
    configService: ConfigService,
    loggerService: ILoggerService,
    exceptionService: IHttpExceptionService,
  ) =>
    new JwtStrategy(
      findUserByEmailUseCase,
      configService,
      loggerService,
      exceptionService,
    ),
};
