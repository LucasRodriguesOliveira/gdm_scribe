import { Provider } from '@nestjs/common';
import { CreateUserUseCase } from '../../../application/usecase/user/create-user.usecase';
import { UserRepository } from '../../repository/user.repository';
import { HttpExceptionService } from '../../http-exception/http-exception.service';
import { LoggerService } from '../../logger/logger.service';
import { BcryptService } from '../../service/bcrypt/bcrypt.service';
import { IUserRepository } from '../../../domain/repository/user/user-repository.interface';
import { IHttpExceptionService } from '../../../domain/exception/http-exception.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { ICryptoService } from '../../../domain/auth/crypto/crypto.interface';
import { Proxy } from '..';

const token = Symbol('__CREATE_USER_USE_CASE__');
const provider: Provider = {
  provide: token,
  inject: [UserRepository, HttpExceptionService, LoggerService, BcryptService],
  useFactory: (
    userRepository: IUserRepository,
    exceptionService: IHttpExceptionService,
    loggerService: ILoggerService,
    cryptoService: ICryptoService,
  ) =>
    new CreateUserUseCase(
      userRepository,
      exceptionService,
      loggerService,
      cryptoService,
    ),
};

export const CreateUserProxy = new Proxy(token, provider);
