import { Test, TestingModule } from '@nestjs/testing';
import { IHttpExceptionService } from '../../../domain/exception/http-exception.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { IContactService } from '../../../domain/service/contact/contact-service.interface';
import { BulkCreateContactUseCase } from './bulk-create-contact.usecase';
import { NotifyUseCase } from './notify.usecase';
import { GrpcContactService } from '../../../infrastructure/service/grpc/grpc-contact.service';
import { HttpExceptionService } from '../../../infrastructure/http-exception/http-exception.service';
import { LoggerService } from '../../../infrastructure/logger/logger.service';
import { createReadStream, ReadStream } from 'fs';
import { UserModel } from '../../../domain/model/user.model';
import { join } from 'path';
import { fakerPT_BR } from '@faker-js/faker/.';
import { Contact } from '../../../domain/model/contact.model';
import { InternalServerErrorException } from '@nestjs/common';
import { IntegrationProgressPayload } from '../../../domain/service/contact/integration-progress.payload';
import { ErrorCode } from '../../../domain/types/error-code.enum';
import { Result } from '../../../domain/types/result';
import { IContactResult } from '../../../domain/service/contact/contact-result.interface';
import { ErrorResponse } from '../../../domain/types/error.interface';

interface NotifyLogOptions {
  should: boolean;
  message: string;
}

const contactServiceMock = {
  bulkCreate: jest.fn(),
};

const notifyUseCaseMock = {
  integrationProgress: jest.fn(),
};

const exceptionServiceMock = {
  internalServerError: jest.fn().mockImplementationOnce(() => {
    throw new InternalServerErrorException();
  }),
};

const loggerServiceMock = {
  error: jest.fn(),
};

describe('BulkCreateContactUseCase', () => {
  let bulkCreateContactUseCase: BulkCreateContactUseCase;
  let contactService: jest.Mocked<IContactService>;
  let notifyUseCase: jest.Mocked<NotifyUseCase>;
  let exceptionService: jest.Mocked<IHttpExceptionService>;
  let loggerService: jest.Mocked<ILoggerService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BulkCreateContactUseCase,
          inject: [
            GrpcContactService,
            NotifyUseCase,
            HttpExceptionService,
            LoggerService,
          ],
          useFactory: (
            contactService: IContactService,
            notifyUseCase: NotifyUseCase,
            exceptionService: IHttpExceptionService,
            loggerService: ILoggerService,
          ) =>
            new BulkCreateContactUseCase(
              contactService,
              notifyUseCase,
              exceptionService,
              loggerService,
            ),
        },
        {
          provide: GrpcContactService,
          useValue: contactServiceMock,
        },
        {
          provide: NotifyUseCase,
          useValue: notifyUseCaseMock,
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

    bulkCreateContactUseCase = app.get<BulkCreateContactUseCase>(
      BulkCreateContactUseCase,
    );
    contactService = app.get(GrpcContactService);
    notifyUseCase = app.get(NotifyUseCase);
    exceptionService = app.get(HttpExceptionService);
    loggerService = app.get(LoggerService);
  });

  it('should be defined', () => {
    expect(contactService).toBeDefined();
    expect(notifyUseCase).toBeDefined();
    expect(exceptionService).toBeDefined();
    expect(loggerService).toBeDefined();
    expect(bulkCreateContactUseCase).toBeDefined();
  });

  describe('run', () => {
    const fileStream: ReadStream = createReadStream(
      join(__dirname, '../../../../test/sample.csv'),
    );
    const userId: UserModel['id'] = fakerPT_BR.string.uuid();

    const contactIds: string[] = [
      fakerPT_BR.database.mongodbObjectId(),
      fakerPT_BR.database.mongodbObjectId(),
    ];

    const contacts: Contact[] = [
      {
        _id: contactIds[0],
        oldid: 1,
        name: 'Roosevelt Schmeler',
        phone: '(61) 98950-6299',
        state: 'DF',
        userId,
      },
      {
        _id: contactIds[1],
        oldid: 2,
        name: 'Theodore Aufderhar',
        phone: '(83) 97213-6942',
        state: 'PB',
        userId,
      },
    ];

    describe('success', () => {
      beforeAll(() => {
        contactService.bulkCreate.mockResolvedValueOnce(
          contacts.map((contact) => ({ value: { contact } })),
        );
      });

      it('should create multiple contacts from a file and return a list of contacts created', async () => {
        const result = await bulkCreateContactUseCase.run(fileStream, userId);

        expect(result).toEqual(contacts);
        expect(notifyUseCase.integrationProgress).toHaveBeenCalledTimes(2);
        expect(notifyUseCase.integrationProgress).toHaveBeenCalledWith<
          [IntegrationProgressPayload, NotifyLogOptions]
        >(
          { progress: 0, userId },
          { should: true, message: 'Starting integration...' },
        );
        expect(notifyUseCase.integrationProgress).toHaveBeenCalledWith<
          [IntegrationProgressPayload, NotifyLogOptions]
        >(
          { progress: 1, userId },
          { should: true, message: `Integration of [2] contacts completed!` },
        );
        expect(contactService.bulkCreate).toHaveBeenCalledWith<
          [ReadStream, UserModel['id']]
        >(fileStream, userId);
        expect(exceptionService.internalServerError).not.toHaveBeenCalled();
        expect(loggerService.error).not.toHaveBeenCalled();
      });
    });

    describe('failure', () => {
      const errorResult: Result<IContactResult, ErrorResponse> = {
        error: { code: ErrorCode.UNEXPECTED, message: '' },
      };
      beforeAll(() => {
        contactService.bulkCreate.mockResolvedValueOnce([errorResult]);
        notifyUseCase.integrationProgress.mockClear();
      });

      it('should try to create multiple contacts from a file and return a list of errors for each failed contact', async () => {
        await expect(
          bulkCreateContactUseCase.run(fileStream, userId),
        ).rejects.toThrowErrorMatchingSnapshot();

        expect(notifyUseCase.integrationProgress).toHaveBeenCalledTimes(1);
        expect(notifyUseCase.integrationProgress).toHaveBeenCalledWith<
          [IntegrationProgressPayload, NotifyLogOptions]
        >(
          { progress: 0, userId },
          { should: true, message: 'Starting integration...' },
        );
        expect(contactService.bulkCreate).toHaveBeenCalledWith<
          [ReadStream, UserModel['id']]
        >(fileStream, userId);
        expect(loggerService.error).toHaveBeenNthCalledWith<[string, string]>(
          1,
          BulkCreateContactUseCase.name,
          JSON.stringify(errorResult.error),
        );
        expect(loggerService.error).toHaveBeenCalledWith<[string, string]>(
          BulkCreateContactUseCase.name,
          'No item could be integrated',
        );
        expect(exceptionService.internalServerError).toHaveBeenCalled();
      });
    });
  });
});
