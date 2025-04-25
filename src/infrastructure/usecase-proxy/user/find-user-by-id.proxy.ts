import { Provider } from '@nestjs/common';
import { FindUserByIdUseCase } from '../../../application/usecase/user/find-user-by-id.usecase';
import { IUserRepository } from '../../../domain/repository/user/user-repository.interface';
import { IHttpExceptionService } from '../../../domain/exception/http-exception.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { UserRepository } from '../../repository/user.repository';
import { HttpExceptionService } from '../../http-exception/http-exception.service';
import { LoggerService } from '../../logger/logger.service';
import { Proxy } from '..';

const token = Symbol('__FIND_USER_BY_ID_USE_CASE__');
const provider: Provider = {
  provide: token,
  useFactory: (
    userRepository: IUserRepository,
    exceptionService: IHttpExceptionService,
    loggerService: ILoggerService,
  ) => new FindUserByIdUseCase(userRepository, exceptionService, loggerService),
  inject: [UserRepository, HttpExceptionService, LoggerService],
};

export const FindUserByIdProxy = new Proxy(token, provider);
