import { Provider } from '@nestjs/common';
import { UserRepository } from '../../repository/user.repository';
import { HttpExceptionService } from '../../http-exception/http-exception.service';
import { LoggerService } from '../../logger/logger.service';
import { IUserRepository } from '../../../domain/repository/user/user-repository.interface';
import { IHttpExceptionService } from '../../../domain/exception/http-exception.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { FindUserByEmailUseCase } from '../../../application/usecase/user/find-user-by-email.usecase';
import { Proxy } from '..';

const token = Symbol('__FIND_USER_BY_EMAIL_USE_CASE__');
const provider: Provider = {
  provide: token,
  inject: [UserRepository, HttpExceptionService, LoggerService],
  useFactory: (
    userRepository: IUserRepository,
    exceptionService: IHttpExceptionService,
    loggerService: ILoggerService,
  ) =>
    new FindUserByEmailUseCase(userRepository, exceptionService, loggerService),
};

export const FindUserByEmailProxy = new Proxy(token, provider);
