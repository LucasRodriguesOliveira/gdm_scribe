import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FindContactByIdUseCase } from './find-contact-by-id.usecase';
import { IContactService } from '../../../domain/service/contact/contact-service.interface';
import { IHttpExceptionService } from '../../../domain/exception/http-exception.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { GrpcContactService } from '../../../infrastructure/service/grpc/grpc-contact.service';
import { HttpExceptionService } from '../../../infrastructure/http-exception/http-exception.service';
import { LoggerService } from '../../../infrastructure/logger/logger.service';
import { Contact } from '../../../domain/model/contact.model';
import { UserModel } from '../../../domain/model/user.model';
import { fakerPT_BR } from '@faker-js/faker/.';
import { IContactResult } from '../../../domain/service/contact/contact-result.interface';
import { ErrorResponse } from '../../../domain/types/error.interface';
import { ErrorCode } from '../../../domain/types/error-code.enum';

const contactServiceMock = {
  findById: jest.fn(),
};

const exceptionServiceMock = {
  notFound: jest.fn().mockImplementation(() => {
    throw new NotFoundException();
  }),
  internalServerError: jest.fn().mockImplementation(() => {
    throw new InternalServerErrorException();
  }),
};

const loggerServiceMock = {
  error: jest.fn(),
};

describe('FindContactByIdUseCase', () => {
  let findContactByIdUseCase: FindContactByIdUseCase;
  let contactService: jest.Mocked<IContactService>;
  let exceptionService: jest.Mocked<IHttpExceptionService>;
  let loggerService: jest.Mocked<ILoggerService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: FindContactByIdUseCase,
          inject: [GrpcContactService, HttpExceptionService, LoggerService],
          useFactory: (
            contactService: IContactService,
            exceptionService: IHttpExceptionService,
            loggerService: ILoggerService,
          ) =>
            new FindContactByIdUseCase(
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

    findContactByIdUseCase = app.get<FindContactByIdUseCase>(
      FindContactByIdUseCase,
    );
    contactService = app.get(GrpcContactService);
    exceptionService = app.get(HttpExceptionService);
    loggerService = app.get(LoggerService);
  });

  it('should be defined', () => {
    expect(contactService).toBeDefined();
    expect(exceptionService).toBeDefined();
    expect(loggerService).toBeDefined();
    expect(findContactByIdUseCase).toBeDefined();
  });

  describe('run', () => {
    const contactId: Contact['_id'] = fakerPT_BR.database.mongodbObjectId();
    const userId: UserModel['id'] = fakerPT_BR.string.uuid();

    const contact: Contact = {
      _id: contactId,
      name: fakerPT_BR.person.fullName(),
      oldid: fakerPT_BR.number.int({ min: 0 }),
      phone: fakerPT_BR.phone.number(),
      state: fakerPT_BR.location.state({ abbreviated: true }),
      userId,
    };

    describe('success', () => {
      const contactResult: IContactResult = {
        contact,
      };

      beforeAll(() => {
        contactService.findById.mockResolvedValueOnce({ value: contactResult });
      });

      it('should find a contact by id', async () => {
        const result = await findContactByIdUseCase.run(contactId, userId);

        expect(result).toEqual(contact);
        expect(contactService.findById).toHaveBeenCalledWith<
          [Contact['_id'], UserModel['id']]
        >(contactId, userId);
      });
    });

    describe('failure', () => {
      describe('not found', () => {
        const errorResultNotFound: ErrorResponse = {
          code: ErrorCode.NOT_FOUND,
          message: fakerPT_BR.string.sample(10),
        };

        beforeAll(() => {
          contactService.findById.mockResolvedValueOnce({
            error: errorResultNotFound,
          });
        });

        it('should not find the contact', async () => {
          await expect(
            findContactByIdUseCase.run(contactId, userId),
          ).rejects.toThrowErrorMatchingSnapshot();

          expect(contactService.findById).toHaveBeenCalledWith<
            [Contact['_id'], UserModel['id']]
          >(contactId, userId);
          expect(exceptionService.notFound).toHaveBeenCalledWith<
            [{ message: string }]
          >({ message: errorResultNotFound.message });
        });
      });

      describe('unexpected', () => {
        const errorResultUnexpected: ErrorResponse = {
          code: ErrorCode.UNEXPECTED,
          message: fakerPT_BR.string.sample(10),
        };

        beforeAll(() => {
          contactService.findById.mockResolvedValueOnce({
            error: errorResultUnexpected,
          });
        });

        it('unexpected error matching case', async () => {
          await expect(
            findContactByIdUseCase.run(contactId, userId),
          ).rejects.toThrowErrorMatchingSnapshot();

          expect(contactService.findById).toHaveBeenCalledWith<
            [Contact['_id'], UserModel['id']]
          >(contactId, userId);
          expect(loggerService.error).toHaveBeenCalledWith<[string, string]>(
            FindContactByIdUseCase.name,
            JSON.stringify(errorResultUnexpected),
          );
          expect(exceptionService.internalServerError).toHaveBeenCalledWith<
            [{ message: string }]
          >({ message: errorResultUnexpected.message });
        });
      });
    });
  });
});
