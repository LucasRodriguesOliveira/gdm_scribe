import { Provider } from '@nestjs/common';
import { LoginUseCase } from '../../../application/usecase/auth/login.usecase';
import { FindUserByEmailUseCase } from '../../../application/usecase/user/find-user-by-email.usecase';
import { IUserRepository } from '../../../domain/repository/user/user-repository.interface';
import { IHttpExceptionService } from '../../../domain/exception/http-exception.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { IJwtService } from '../../../domain/auth/jwt/jwt.interface';
import { ICryptoService } from '../../../domain/auth/crypto/crypto.interface';
import { UserRepository } from '../../repository/user.repository';
import { HttpExceptionService } from '../../http-exception/http-exception.service';
import { LoggerService } from '../../logger/logger.service';
import { JwtTokenService } from '../../service/jwt/jwt.service';
import { BcryptService } from '../../service/bcrypt/bcrypt.service';
import { Proxy } from '..';

const token = Symbol('__LOGIN_USE_CASE__');
const provider: Provider = {
  provide: token,
  inject: [
    UserRepository,
    HttpExceptionService,
    LoggerService,
    JwtTokenService,
    BcryptService,
  ],
  useFactory: (
    userRepository: IUserRepository,
    exceptionService: IHttpExceptionService,
    loggerService: ILoggerService,
    jwtTokenService: IJwtService,
    cryptoService: ICryptoService,
  ) =>
    new LoginUseCase(
      new FindUserByEmailUseCase(
        userRepository,
        exceptionService,
        loggerService,
      ),
      cryptoService,
      jwtTokenService,
      loggerService,
      exceptionService,
    ),
};

export const LoginProxy = new Proxy(token, provider);
