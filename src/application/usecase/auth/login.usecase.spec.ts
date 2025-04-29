import { Test, TestingModule } from '@nestjs/testing';
import { ICryptoService } from '../../../domain/auth/crypto/crypto.interface';
import { IJwtService } from '../../../domain/auth/jwt/jwt.interface';
import { IHttpExceptionService } from '../../../domain/exception/http-exception.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { FindUserByEmailUseCase } from '../user/find-user-by-email.usecase';
import { LoginUseCase } from './login.usecase';
import { BcryptService } from '../../../infrastructure/service/bcrypt/bcrypt.service';
import { JwtTokenService } from '../../../infrastructure/service/jwt/jwt.service';
import { LoggerService } from '../../../infrastructure/logger/logger.service';
import { HttpExceptionService } from '../../../infrastructure/http-exception/http-exception.service';
import { fakerPT_BR } from '@faker-js/faker/.';
import { UserModel } from '../../../domain/model/user.model';
import { JwtPayload } from '../../../domain/auth/jwt/jwt-payload.interface';
import { UnauthorizedException } from '@nestjs/common';

const findUserByEmailUseCaseMock = {
  run: jest.fn(),
};

const cryptoServiceMock = {
  compare: jest.fn(),
};

const jwtServiceMock = {
  createToken: jest.fn(),
};

const loggerServiceMock = {
  warn: jest.fn(),
};

const exceptionServiceMock = {
  unauthorized: jest.fn().mockImplementationOnce(() => {
    throw new UnauthorizedException();
  }),
};

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let findUserByEmailUseCase: jest.Mocked<FindUserByEmailUseCase>;
  let cryptoService: jest.Mocked<ICryptoService>;
  let jwtService: jest.Mocked<IJwtService>;
  let loggerService: jest.Mocked<ILoggerService>;
  let exceptionService: jest.Mocked<IHttpExceptionService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LoginUseCase,
          useFactory: (
            findUserByEmailUseCase,
            cryptoService,
            jwtService,
            loggerService,
            exceptionService,
          ) =>
            new LoginUseCase(
              findUserByEmailUseCase,
              cryptoService,
              jwtService,
              loggerService,
              exceptionService,
            ),
          inject: [
            FindUserByEmailUseCase,
            BcryptService,
            JwtTokenService,
            LoggerService,
            HttpExceptionService,
          ],
        },
        {
          provide: FindUserByEmailUseCase,
          useValue: findUserByEmailUseCaseMock,
        },
        {
          provide: BcryptService,
          useValue: cryptoServiceMock,
        },
        {
          provide: JwtTokenService,
          useValue: jwtServiceMock,
        },
        {
          provide: LoggerService,
          useValue: loggerServiceMock,
        },
        {
          provide: HttpExceptionService,
          useValue: exceptionServiceMock,
        },
      ],
    }).compile();

    loginUseCase = app.get<LoginUseCase>(LoginUseCase);
    findUserByEmailUseCase = app.get(FindUserByEmailUseCase);
    cryptoService = app.get(BcryptService);
    jwtService = app.get(JwtTokenService);
    loggerService = app.get(LoggerService);
    exceptionService = app.get(HttpExceptionService);
  });

  it('should be defined', () => {
    expect(exceptionService).toBeDefined();
    expect(findUserByEmailUseCase).toBeDefined();
    expect(cryptoService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(loggerService).toBeDefined();
    expect(loginUseCase).toBeDefined();
  });

  const user: UserModel = {
    id: fakerPT_BR.string.uuid(),
    name: fakerPT_BR.person.fullName(),
    email: fakerPT_BR.internet.email(),
    password: fakerPT_BR.internet.password(),
    createdAt: fakerPT_BR.date.anytime(),
  };

  describe('checkUser', () => {
    const { email, password } = user;

    beforeEach(() => {
      findUserByEmailUseCase.run.mockResolvedValueOnce(user);
    });

    describe('correct password', () => {
      beforeAll(() => {
        cryptoService.compare.mockResolvedValueOnce(true);
      });

      it('should authorize user to login', async () => {
        const result = await loginUseCase.checkUser(email, password);

        expect(result).toEqual(user);
        expect(findUserByEmailUseCase.run).toHaveBeenCalledWith<[string]>(
          email,
        );
        expect(cryptoService.compare).toHaveBeenCalledWith<[string, string]>(
          password,
          user.password,
        );
        expect(loggerService.warn).not.toHaveBeenCalled();
        expect(exceptionService.unauthorized).not.toHaveBeenCalled();
      });
    });

    describe('wrong password', () => {
      const wrongPassword = fakerPT_BR.internet.password();

      beforeAll(() => {
        cryptoService.compare.mockResolvedValueOnce(false);
        user.password = wrongPassword;
      });

      afterAll(() => {
        user.password = password;
      });

      it('should not authorize user to login', async () => {
        await expect(
          loginUseCase.checkUser(email, password),
        ).rejects.toThrowErrorMatchingSnapshot();

        expect(findUserByEmailUseCase.run).toHaveBeenCalledWith<[string]>(
          email,
        );
        expect(cryptoService.compare).toHaveBeenCalledWith<[string, string]>(
          password,
          wrongPassword,
        );

        const userCopy: UserModel = Object.assign({}, user);
        delete userCopy.password;

        const log = {
          message: `Invalid credentials.`,
          params: {
            email,
          },
          user: userCopy,
        };

        expect(loggerService.warn).toHaveBeenCalledWith<[string, string]>(
          LoginUseCase.name,
          JSON.stringify(log),
        );
        expect(exceptionService.unauthorized).toHaveBeenCalledWith<
          [{ message: string }]
        >({ message: log.message });
      });
    });
  });

  describe('login', () => {
    const expectedToken = fakerPT_BR.internet.jwt();

    beforeAll(() => {
      jwtService.createToken.mockResolvedValueOnce(expectedToken);
    });

    it('should create a jwt token for a given user', async () => {
      const result = await loginUseCase.login(user);

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
      };

      expect(result).toEqual(expectedToken);
      expect(jwtService.createToken).toHaveBeenCalledWith<[JwtPayload]>(
        payload,
      );
    });
  });
});
