import { Test, TestingModule } from '@nestjs/testing';
import { IHttpExceptionService } from '../../../domain/exception/http-exception.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { IContactService } from '../../../domain/service/contact/contact-service.interface';
import { ListContactUseCase } from './list-contact.usecase';
import { GrpcContactService } from '../../../infrastructure/service/grpc/grpc-contact.service';
import { HttpExceptionService } from '../../../infrastructure/http-exception/http-exception.service';
import { LoggerService } from '../../../infrastructure/logger/logger.service';
import { fakerPT_BR } from '@faker-js/faker/.';
import { UserModel } from '../../../domain/model/user.model';
import { IContactResultList } from '../../../domain/service/contact/contact-result-list.interface';
import { InternalServerErrorException } from '@nestjs/common';
import { ErrorResponse } from '../../../domain/types/error.interface';
import { ErrorCode } from '../../../domain/types/error-code.enum';

interface QueryContact {
  name?: string;
  state?: string;
  page: number;
  pageSize: number;
}

const contactServiceMock = {
  list: jest.fn(),
};

const exceptionServiceMock = {
  internalServerError: jest.fn().mockImplementationOnce(() => {
    throw new InternalServerErrorException();
  }),
};

const loggerServiceMock = {
  error: jest.fn(),
};

describe('ListContactUseCase', () => {
  let listContactUseCase: ListContactUseCase;
  let contactService: jest.Mocked<IContactService>;
  let exceptionService: jest.Mocked<IHttpExceptionService>;
  let loggerService: jest.Mocked<ILoggerService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ListContactUseCase,
          inject: [GrpcContactService, HttpExceptionService, LoggerService],
          useFactory: (
            contactService: IContactService,
            exceptionService: IHttpExceptionService,
            loggerService: ILoggerService,
          ) =>
            new ListContactUseCase(
              contactService,
              exceptionService,
              loggerService,
            ),
        },
        {
          provide: GrpcContactService,
          useValue: contactServiceMock,
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

    listContactUseCase = app.get<ListContactUseCase>(ListContactUseCase);
    contactService = app.get(GrpcContactService);
    exceptionService = app.get(HttpExceptionService);
    loggerService = app.get(LoggerService);
  });

  it('should be defined', () => {
    expect(contactService).toBeDefined();
    expect(exceptionService).toBeDefined();
    expect(loggerService).toBeDefined();
    expect(listContactUseCase).toBeDefined();
  });

  describe('run', () => {
    const query: QueryContact = {
      page: 1,
      pageSize: 10,
      name: fakerPT_BR.person.fullName(),
      state: fakerPT_BR.location.state({ abbreviated: true }),
    };
    const userId: UserModel['id'] = fakerPT_BR.string.uuid();

    describe('success', () => {
      const expected: IContactResultList = {
        items: [
          {
            _id: fakerPT_BR.database.mongodbObjectId(),
            oldid: fakerPT_BR.number.int({ min: 0 }),
            userId,
            name: query.name,
            phone: fakerPT_BR.phone.number(),
            state: query.state,
          },
        ],
        page: 1,
        pageSize: 10,
        total: 1,
      };

      beforeAll(() => {
        contactService.list.mockResolvedValueOnce({ value: expected });
      });

      it('should return a paginated list of contacts', async () => {
        const result = await listContactUseCase.run(query, userId);

        expect(result).toEqual(expected);
        expect(contactService.list).toHaveBeenCalledWith<
          [QueryContact, UserModel['id']]
        >(query, userId);
      });
    });

    describe('failure', () => {
      const errorResult: ErrorResponse = {
        code: ErrorCode.UNEXPECTED,
        message: fakerPT_BR.string.sample(10),
      };

      beforeAll(() => {
        contactService.list.mockResolvedValueOnce({ error: errorResult });
      });

      it('should thrown an InternalServerErrorException', async () => {
        await expect(
          listContactUseCase.run(query, userId),
        ).rejects.toThrowErrorMatchingSnapshot();

        expect(contactService.list).toHaveBeenCalledWith<
          [QueryContact, UserModel['id']]
        >(query, userId);
        expect(loggerService.error).toHaveBeenCalledWith<[string, string]>(
          ListContactUseCase.name,
          JSON.stringify(errorResult),
        );
        expect(exceptionService.internalServerError).toHaveBeenCalledWith<
          [{ message: string }]
        >({ message: errorResult.message });
      });
    });
  });
});
