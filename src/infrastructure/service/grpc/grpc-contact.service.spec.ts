import { ClientGrpc } from '@nestjs/microservices';
import { GrpcContactService } from './grpc-contact.service';
import { RabbitmqContactService } from '../rabbitMQ/rabbitmq-contact.service';
import { Test, TestingModule } from '@nestjs/testing';
import { grpcContactClientToken } from '../../config/grpc/grpc-contact.config';
import { GRPCService } from './grpc-service.enum';
import { Contact } from '../../../domain/model/contact.model';
import { UserModel } from '../../../domain/model/user.model';
import { fakerPT_BR } from '@faker-js/faker/.';
import { Result } from '../../../domain/types/result';
import { IContactResult } from '../../../domain/service/contact/contact-result.interface';
import { ErrorResponse } from '../../../domain/types/error.interface';
import { Observable, ReplaySubject } from 'rxjs';
import { FindContactByIdRequest } from '../../grpc/service/contact/messages/find-contact-by-id.message';
import { IContactQuery } from '../../../domain/service/contact/contact-query.interface';
import { IContactResultList } from '../../../domain/service/contact/contact-result-list.interface';
import { QueryContactRequest } from '../../grpc/service/contact/messages/query-contact.message';
import { CreateContactRequest } from '../../grpc/service/contact/messages/create-contact.message';
import { createReadStream, ReadStream } from 'fs';
import { join } from 'path';

const grpcService = {
  findById: jest.fn(),
  list: jest.fn(),
  create: jest.fn(),
  bulkCreate: jest.fn(),
};

const clientGrpcMock = {
  getService: jest.fn().mockImplementation(() => grpcService),
};

const queueContactServiceMock = {
  integrationProgress: jest.fn(),
};

describe('GrpcContactService', () => {
  let grpcContactService: GrpcContactService;
  let clientGrpc: jest.Mocked<ClientGrpc>;
  let queueContactService: jest.Mocked<RabbitmqContactService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        GrpcContactService,
        {
          provide: grpcContactClientToken.description!,
          useValue: clientGrpcMock,
        },
        { provide: RabbitmqContactService, useValue: queueContactServiceMock },
      ],
    }).compile();

    grpcContactService = app.get<GrpcContactService>(GrpcContactService);
    clientGrpc = app.get<jest.Mocked<ClientGrpc>>(
      grpcContactClientToken.description!,
    );
    queueContactService = app.get<jest.Mocked<RabbitmqContactService>>(
      RabbitmqContactService,
    );

    grpcContactService.onModuleInit();
  });

  it('should be defined', () => {
    expect(queueContactService).toBeDefined();
    expect(clientGrpc).toBeDefined();
    expect(grpcContactService).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize the `grpcContactService`', () => {
      grpcContactService.onModuleInit();

      expect(clientGrpc.getService).toHaveBeenCalledWith<[GRPCService]>(
        GRPCService.CONTACT,
      );
    });
  });

  describe('findById', () => {
    const contactId: Contact['_id'] = fakerPT_BR.database.mongodbObjectId();
    const userId: UserModel['id'] = fakerPT_BR.string.uuid();

    const contactResult: Result<IContactResult, ErrorResponse> = {
      value: {
        contact: {
          _id: contactId,
          name: fakerPT_BR.person.fullName(),
          oldid: fakerPT_BR.number.int({ min: 0 }),
          phone: fakerPT_BR.phone.number(),
          state: fakerPT_BR.location.state({ abbreviated: true }),
          userId,
        },
      },
    };

    beforeAll(() => {
      const subject = new Observable<Result<IContactResult, ErrorResponse>>(
        (sub) => {
          sub.next(contactResult);
          sub.complete();
        },
      );
      grpcService.findById.mockReturnValueOnce(subject);
    });

    it('should return a contact by id from gRPC server', async () => {
      const result = await grpcContactService.findById(contactId, userId);

      expect(result).toEqual(contactResult);
      expect(grpcService.findById).toHaveBeenCalledWith<
        [FindContactByIdRequest]
      >({ id: contactId, userId });
    });
  });

  describe('list', () => {
    const query: IContactQuery = {
      page: 1,
      pageSize: 10,
    };

    const userId: UserModel['id'] = fakerPT_BR.string.uuid();

    const contacts: Contact[] = [
      {
        _id: fakerPT_BR.database.mongodbObjectId(),
        oldid: fakerPT_BR.number.int({ min: 0 }),
        name: fakerPT_BR.person.fullName(),
        phone: fakerPT_BR.phone.number(),
        state: fakerPT_BR.location.state({ abbreviated: true }),
        userId,
      },
    ];

    const contactListResult: Result<IContactResultList, ErrorResponse> = {
      value: {
        items: contacts,
        page: query.page,
        pageSize: query.pageSize,
        total: contacts.length,
      },
    };

    beforeAll(() => {
      const subject = new Observable<Result<IContactResultList, ErrorResponse>>(
        (sub) => {
          sub.next(contactListResult);
          sub.complete();
        },
      );

      grpcService.list.mockReturnValueOnce(subject);
    });

    it('should return a paginated list of contacts', async () => {
      const result = await grpcContactService.list(query, userId);

      expect(result).toEqual(contactListResult);
      expect(grpcService.list).toHaveBeenCalledWith<[QueryContactRequest]>({
        ...query,
        userId,
      });
    });
  });

  describe('create', () => {
    const data: Partial<Contact> = {
      name: fakerPT_BR.person.fullName(),
      phone: fakerPT_BR.phone.number(),
      state: fakerPT_BR.location.state({ abbreviated: true }),
    };

    const userId: UserModel['id'] = fakerPT_BR.string.uuid();

    const contact: Contact = {
      _id: fakerPT_BR.database.mongodbObjectId(),
      oldid: null,
      name: data.name,
      phone: data.phone,
      state: data.state,
      userId,
    };

    const contactResult: Result<IContactResult, ErrorResponse> = {
      value: {
        contact,
      },
    };

    beforeAll(() => {
      const subject = new Observable<Result<IContactResult, ErrorResponse>>(
        (sub) => {
          sub.next(contactResult);
          sub.complete();
        },
      );

      grpcService.create.mockReturnValueOnce(subject);
    });

    it('should create a contact', async () => {
      const result = await grpcContactService.create(data as Contact, userId);

      expect(result).toEqual(contactResult);
      expect(grpcService.create).toHaveBeenCalledWith<[CreateContactRequest]>({
        ...(data as Contact),
        userId,
      });
    });
  });

  describe('bulkCreate', () => {
    const sampleFilePath = join(__dirname, '../../../../test/sample.csv');

    const fileStream: ReadStream = createReadStream(sampleFilePath);
    const userId: UserModel['id'] = fakerPT_BR.string.uuid();

    const contactsCreated: Contact[] = [
      {
        _id: fakerPT_BR.database.mongodbObjectId(),
        oldid: 1,
        name: 'Roosevelt Schmeler',
        phone: '(61) 98950-6299',
        state: 'DF',
        userId,
      },
      {
        _id: fakerPT_BR.database.mongodbObjectId(),
        oldid: 2,
        name: 'Theodore Aufderhar',
        phone: '(83) 97213-6942',
        state: 'PB',
        userId,
      },
    ];

    const contactResult: Result<Contact, ErrorResponse>[] = contactsCreated.map(
      (contactCreated) => ({
        value: contactCreated,
      }),
    );

    beforeAll(() => {
      grpcService.bulkCreate.mockImplementationOnce(
        (messages: Observable<CreateContactRequest>) => {
          const subject = new ReplaySubject<Result<Contact, ErrorResponse>>();

          let userId: UserModel['id'];
          let count = 0;
          const onNext = async (message: CreateContactRequest) => {
            const result = {
              ...message,
              oldid: message.oldid,
              _id: contactsCreated[count]._id,
            };
            count++;

            if (!userId) {
              userId = message.userId;
            }

            subject.next({
              value: result,
            });
          };

          messages.subscribe({
            next: onNext,
            complete: () => subject.complete(),
          });

          return subject.asObservable();
        },
      );
    });

    it('should create many contacts from data in files', async () => {
      const result = await grpcContactService.bulkCreate(fileStream, userId);

      expect(result).toEqual(contactResult);
    });
  });
});
