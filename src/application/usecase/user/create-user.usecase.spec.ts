import { InternalServerErrorException } from '@nestjs/common';
import { CreateUserUseCase } from './create-user.usecase';
import { IUserRepository } from '../../../domain/repository/user/user-repository.interface';
import { IHttpExceptionService } from '../../../domain/exception/http-exception.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { ICryptoService } from '../../../domain/auth/crypto/crypto.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { HttpExceptionService } from '../../../infrastructure/http-exception/http-exception.service';
import { LoggerService } from '../../../infrastructure/logger/logger.service';
import { BcryptService } from '../../../infrastructure/service/bcrypt/bcrypt.service';
import { UserModel } from '../../../domain/model/user.model';
import { fakerPT_BR } from '@faker-js/faker/.';

const userRepositoryMock = {
  create: jest.fn(),
};

const exceptionServiceMock = {
  internalServerError: jest.fn().mockImplementationOnce(() => {
    throw new InternalServerErrorException();
  }),
};

const loggerServiceMock = {
  log: jest.fn(),
  error: jest.fn(),
};

const cryptoServiceMock = {
  hash: jest.fn(),
};

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let exceptionService: jest.Mocked<IHttpExceptionService>;
  let loggerService: jest.Mocked<ILoggerService>;
  let cryptoService: jest.Mocked<ICryptoService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CreateUserUseCase,
          inject: [
            UserRepository,
            HttpExceptionService,
            LoggerService,
            BcryptService,
          ],
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
        },
        {
          provide: UserRepository,
          useValue: userRepositoryMock,
        },
        {
          provide: HttpExceptionService,
          useValue: exceptionServiceMock,
        },
        {
          provide: LoggerService,
          useValue: loggerServiceMock,
        },
        {
          provide: BcryptService,
          useValue: cryptoServiceMock,
        },
      ],
    }).compile();

    createUserUseCase = app.get<CreateUserUseCase>(CreateUserUseCase);
    userRepository = app.get(UserRepository);
    exceptionService = app.get(HttpExceptionService);
    loggerService = app.get(LoggerService);
    cryptoService = app.get(BcryptService);
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
    expect(exceptionService).toBeDefined();
    expect(loggerService).toBeDefined();
    expect(cryptoService).toBeDefined();
    expect(createUserUseCase).toBeDefined();
  });

  describe('run', () => {
    describe('success', () => {
      const oldPassword = fakerPT_BR.internet.password({ length: 10 });
      const hashedPassword = fakerPT_BR.internet.password({ length: 20 });

      const userData: Partial<UserModel> = {
        name: fakerPT_BR.person.fullName(),
        email: fakerPT_BR.internet.email(),
        password: `${oldPassword}`,
      };

      const user: UserModel = {
        id: fakerPT_BR.string.uuid(),
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        createdAt: new Date(),
      };

      const log = {
        message: `User [${user.id}] created!`,
        params: { ...userData, password: hashedPassword },
        result: user,
      };

      beforeAll(() => {
        cryptoService.hash.mockResolvedValueOnce(hashedPassword);
        userRepository.create.mockResolvedValueOnce(user);
      });

      it('should create a user successfully', async () => {
        const result = await createUserUseCase.run({ ...userData });

        expect(result).toEqual(user);
        expect(cryptoService.hash).toHaveBeenCalledWith<[string]>(
          userData.password,
        );
        expect(userRepository.create).toHaveBeenCalledWith<
          [Partial<UserModel>]
        >({ ...userData, password: hashedPassword });
        expect(loggerService.log).toHaveBeenCalledWith<[string, string]>(
          CreateUserUseCase.name,
          JSON.stringify(log),
        );
      });
    });

    describe('failure', () => {
      const userData: Partial<UserModel> = {
        name: fakerPT_BR.person.fullName(),
        email: fakerPT_BR.internet.email(),
        password: fakerPT_BR.internet.password({ length: 10 }),
      };

      const user: UserModel = {
        id: fakerPT_BR.string.uuid(),
        name: userData.name,
        email: userData.email,
        // already encrypted by cryptoService
        password: fakerPT_BR.internet.password({ length: 20 }),
        createdAt: new Date(),
      };

      const log = {
        message: `User could not be created`,
        params: { ...userData, password: user.password },
        error: new Error(),
      };

      beforeAll(() => {
        cryptoService.hash.mockClear();
        cryptoService.hash.mockResolvedValueOnce(user.password);
        userRepository.create.mockImplementationOnce(() => {
          throw new Error();
        });
      });

      it('should throw an error', async () => {
        await expect(
          createUserUseCase.run({ ...userData }),
        ).rejects.toThrowErrorMatchingSnapshot();

        expect(cryptoService.hash).toHaveBeenCalledWith<[string]>(
          userData.password,
        );
        expect(loggerService.error).toHaveBeenCalledWith<[string, string]>(
          CreateUserUseCase.name,
          JSON.stringify(log),
        );
        expect(exceptionService.internalServerError).toHaveBeenCalledWith<
          [{ message: string }]
        >({ message: log.message });
      });
    });
  });
});
