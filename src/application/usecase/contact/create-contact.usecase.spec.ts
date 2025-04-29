import { Test, TestingModule } from '@nestjs/testing';
import { IHttpExceptionService } from '../../../domain/exception/http-exception.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { IContactService } from '../../../domain/service/contact/contact-service.interface';
import { CreateContactUseCase } from './create-contact.usecase';
import { GrpcContactService } from '../../../infrastructure/service/grpc/grpc-contact.service';
import { HttpExceptionService } from '../../../infrastructure/http-exception/http-exception.service';
import { LoggerService } from '../../../infrastructure/logger/logger.service';
import { CreateContactDto } from '../../../interfaces/controller/contact/dto/create-contact.dto';
import { fakerPT_BR } from '@faker-js/faker/.';
import { UserModel } from '../../../domain/model/user.model';
import { IContactResult } from '../../../domain/service/contact/contact-result.interface';
import { ErrorResponse } from '../../../domain/types/error.interface';
import { ErrorCode } from '../../../domain/types/error-code.enum';
import { InternalServerErrorException } from '@nestjs/common';

const contactServiceMock = {
  create: jest.fn(),
};

const exceptionServiceMock = {
  internalServerError: jest.fn().mockImplementationOnce(() => {
    throw new InternalServerErrorException();
  }),
};

const loggerServiceMock = {
  error: jest.fn(),
};

describe('CreateContactUseCase', () => {
  let createContactUseCase: CreateContactUseCase;
  let contactService: jest.Mocked<IContactService>;
  let exceptionService: jest.Mocked<IHttpExceptionService>;
  let loggerService: jest.Mocked<ILoggerService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CreateContactUseCase,
          inject: [GrpcContactService, HttpExceptionService, LoggerService],
          useFactory: (
            contactService: IContactService,
            exceptionService: IHttpExceptionService,
            loggerService: ILoggerService,
          ) =>
            new CreateContactUseCase(
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

    createContactUseCase = app.get<CreateContactUseCase>(CreateContactUseCase);
    contactService = app.get(GrpcContactService);
    exceptionService = app.get(HttpExceptionService);
    loggerService = app.get(LoggerService);
  });

  it('should be defined', () => {
    expect(contactService).toBeDefined();
    expect(exceptionService).toBeDefined();
    expect(loggerService).toBeDefined();
    expect(createContactUseCase).toBeDefined();
  });

  describe('run', () => {
    const createContactDto: CreateContactDto = {
      name: fakerPT_BR.person.fullName(),
      phone: fakerPT_BR.phone.number(),
      state: fakerPT_BR.location.state({ abbreviated: true }),
    };
    const userId: UserModel['id'] = fakerPT_BR.string.uuid();
    const contactResult: IContactResult = {
      contact: {
        ...createContactDto,
        _id: fakerPT_BR.database.mongodbObjectId(),
        oldid: 0,
        userId,
      },
    };
    const errorResult: ErrorResponse = {
      code: ErrorCode.UNEXPECTED,
      message: fakerPT_BR.string.sample(10),
    };

    beforeAll(() => {
      contactService.create.mockResolvedValueOnce({ value: contactResult });
      contactService.create.mockResolvedValueOnce({ error: errorResult });
    });

    describe('success', () => {
      it('should return a contact created', async () => {
        const result = await createContactUseCase.run(createContactDto, userId);

        expect(result).toEqual(contactResult.contact);
        expect(contactService.create).toHaveBeenCalledWith<
          [CreateContactDto, string]
        >(createContactDto, userId);
      });
    });

    describe('failure', () => {
      it('should throw an internal server error exception', async () => {
        await expect(
          createContactUseCase.run(createContactDto, userId),
        ).rejects.toThrowErrorMatchingSnapshot();

        expect(contactService.create).toHaveBeenCalledWith<
          [CreateContactDto, string]
        >(createContactDto, userId);
        expect(loggerService.error).toHaveBeenCalledWith<[string, string]>(
          CreateContactUseCase.name,
          JSON.stringify(errorResult),
        );
        expect(exceptionService.internalServerError).toHaveBeenCalledWith<
          [{ message: string }]
        >({ message: errorResult.message });
      });
    });
  });
});
