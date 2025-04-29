import { Test, TestingModule } from '@nestjs/testing';
import { IHttpExceptionService } from '../../../domain/exception/http-exception.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { IUserRepository } from '../../../domain/repository/user/user-repository.interface';
import { FindUserByEmailUseCase } from './find-user-by-email.usecase';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { HttpExceptionService } from '../../../infrastructure/http-exception/http-exception.service';
import { LoggerService } from '../../../infrastructure/logger/logger.service';
import { fakerPT_BR } from '@faker-js/faker/.';
import { UserModel } from '../../../domain/model/user.model';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseError } from '../../../domain/types/database.error';
import { DatabaseErrors } from '../../../domain/types/database-errors.enum';

class DBError implements DatabaseError {
  constructor(public readonly code: DatabaseErrors) {}
}

const userRepositoryMock = {
  findByEmail: jest.fn(),
};

const exceptionServiceMock = {
  notFound: jest.fn().mockImplementationOnce(() => {
    throw new NotFoundException();
  }),
  internalServerError: jest.fn().mockImplementationOnce(() => {
    throw new InternalServerErrorException();
  }),
};

const loggerServiceMock = {
  warn: jest.fn(),
  error: jest.fn(),
};

describe('FindUserByEmailUseCase', () => {
  let findUserByEmailUseCase: FindUserByEmailUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let exceptionService: jest.Mocked<IHttpExceptionService>;
  let loggerService: jest.Mocked<ILoggerService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: FindUserByEmailUseCase,
          inject: [UserRepository, HttpExceptionService, LoggerService],
          useFactory: (
            userRepository: IUserRepository,
            exceptionService: IHttpExceptionService,
            loggerService: ILoggerService,
          ) =>
            new FindUserByEmailUseCase(
              userRepository,
              exceptionService,
              loggerService,
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
      ],
    }).compile();

    findUserByEmailUseCase = app.get<FindUserByEmailUseCase>(
      FindUserByEmailUseCase,
    );
    userRepository = app.get(UserRepository);
    exceptionService = app.get(HttpExceptionService);
    loggerService = app.get(LoggerService);
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
    expect(exceptionService).toBeDefined();
    expect(loggerService).toBeDefined();
    expect(findUserByEmailUseCase).toBeDefined();
  });

  describe('run', () => {
    const email: string = fakerPT_BR.internet.email();

    describe('success', () => {
      const user: UserModel = {
        id: fakerPT_BR.string.uuid(),
        name: fakerPT_BR.person.fullName(),
        email,
        password: fakerPT_BR.internet.password(),
        createdAt: fakerPT_BR.date.anytime(),
      };

      beforeAll(() => {
        userRepository.findByEmail.mockResolvedValueOnce(user);
      });

      it('should find a user by email', async () => {
        const result = await findUserByEmailUseCase.run(email);

        expect(result).toEqual(user);
        expect(userRepository.findByEmail).toHaveBeenCalledWith<[string]>(
          email,
        );
      });
    });

    describe('failure', () => {
      describe('NotFound', () => {
        const log = {
          message: `User [${email}] could not be found.`,
          error: new DBError(DatabaseErrors.NOT_FOUND),
        };

        beforeAll(() => {
          userRepository.findByEmail.mockImplementationOnce(() => {
            throw new DBError(DatabaseErrors.NOT_FOUND);
          });
        });

        it('should throw an NotFoundException', async () => {
          await expect(
            findUserByEmailUseCase.run(email),
          ).rejects.toThrowErrorMatchingSnapshot();

          expect(loggerService.warn).toHaveBeenCalledWith<[string, string]>(
            FindUserByEmailUseCase.name,
            JSON.stringify(log),
          );
          expect(exceptionService.notFound).toHaveBeenCalledWith<
            [{ message: string }]
          >({
            message: log.message,
          });
        });
      });

      describe('InternalServerError', () => {
        const log = {
          message: `Unexpected error occurred!`,
          error: new DBError(DatabaseErrors.UNEXPECTED),
        };

        beforeAll(() => {
          userRepository.findByEmail.mockImplementationOnce(() => {
            throw new DBError(DatabaseErrors.UNEXPECTED);
          });
        });

        it('should throw an InternalServerErrorException', async () => {
          await expect(
            findUserByEmailUseCase.run(email),
          ).rejects.toThrowErrorMatchingSnapshot();

          expect(loggerService.error).toHaveBeenCalledWith<[string, string]>(
            FindUserByEmailUseCase.name,
            JSON.stringify(log),
          );
          expect(exceptionService.internalServerError).toHaveBeenCalledWith<
            [{ message: string }]
          >({
            message: log.message,
          });
        });
      });
    });
  });
});
