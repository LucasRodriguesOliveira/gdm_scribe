import { Test, TestingModule } from '@nestjs/testing';
import { ContactController } from './contact.controller';
import { FindContactByIdProxy } from '../../../infrastructure/usecase-proxy/contact/find-contact-by-id.proxy';
import { ListContactProxy } from '../../../infrastructure/usecase-proxy/contact/list-contact.proxy';
import { CreateContactProxy } from '../../../infrastructure/usecase-proxy/contact/create-contact.proxy';
import { BulkCreateContactProxy } from '../../../infrastructure/usecase-proxy/contact/bulk-create-contact.proxy';
import { FindContactByIdUseCase } from '../../../application/usecase/contact/find-contact-by-id.usecase';
import { ListContactUseCase } from '../../../application/usecase/contact/list-contact.usecase';
import { CreateContactUseCase } from '../../../application/usecase/contact/create-contact.usecase';
import { BulkCreateContactUseCase } from '../../../application/usecase/contact/bulk-create-contact.usecase';
import { QueryContactDto } from './dto/query-contact.dto';
import { UserModel } from '../../../domain/model/user.model';
import { fakerPT_BR } from '@faker-js/faker/.';
import { IContactResultList } from '../../../domain/service/contact/contact-result-list.interface';
import { Contact } from '../../../domain/model/contact.model';
import { plainToInstance } from 'class-transformer';
import {
  ListContactPresenter,
  ListItemContactPresenter,
} from './presenter/list-contact.presenter';
import { CreateContactDto } from './dto/create-contact.dto';
import { join } from 'path';

const findContactByIdUseCaseMock = {
  run: jest.fn(),
};

const listContactUseCaseMock = {
  run: jest.fn(),
};

const createContactUseCaseMock = {
  run: jest.fn(),
};

const bulkCreateContactUseCaseMock = {
  run: jest.fn(),
};

describe('ContactController', () => {
  let contactController: ContactController;
  let findContactByIdUseCase: jest.Mocked<FindContactByIdUseCase>;
  let listContactUseCase: jest.Mocked<ListContactUseCase>;
  let createContactUseCase: jest.Mocked<CreateContactUseCase>;
  let bulkCreateContactUseCase: jest.Mocked<BulkCreateContactUseCase>;

  const connectedUser: UserModel = {
    id: fakerPT_BR.string.uuid(),
    name: fakerPT_BR.person.fullName(),
    email: fakerPT_BR.internet.email(),
    password: fakerPT_BR.internet.password({ length: 10 }),
    createdAt: fakerPT_BR.date.anytime(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: FindContactByIdProxy.Token,
          useValue: findContactByIdUseCaseMock,
        },
        {
          provide: ListContactProxy.Token,
          useValue: listContactUseCaseMock,
        },
        {
          provide: CreateContactProxy.Token,
          useValue: createContactUseCaseMock,
        },
        {
          provide: BulkCreateContactProxy.Token,
          useValue: bulkCreateContactUseCaseMock,
        },
      ],
      controllers: [ContactController],
    }).compile();

    contactController = app.get<ContactController>(ContactController);
    findContactByIdUseCase = app.get<jest.Mocked<FindContactByIdUseCase>>(
      FindContactByIdProxy.Token,
    );
    listContactUseCase = app.get<jest.Mocked<ListContactUseCase>>(
      ListContactProxy.Token,
    );
    createContactUseCase = app.get<jest.Mocked<CreateContactUseCase>>(
      CreateContactProxy.Token,
    );
    bulkCreateContactUseCase = app.get<jest.Mocked<BulkCreateContactUseCase>>(
      BulkCreateContactProxy.Token,
    );
  });

  it('should be defined', () => {
    expect(findContactByIdUseCase).toBeDefined();
    expect(listContactUseCase).toBeDefined();
    expect(createContactUseCase).toBeDefined();
    expect(bulkCreateContactUseCase).toBeDefined();
    expect(contactController).toBeDefined();
  });

  describe('list', () => {
    const queryContactDto: QueryContactDto = {
      page: 1,
      pageSize: 10,
    };

    const contact: Contact = {
      _id: fakerPT_BR.database.mongodbObjectId(),
      oldid: fakerPT_BR.number.int({ min: 0 }),
      name: fakerPT_BR.person.fullName(),
      phone: fakerPT_BR.phone.number(),
      state: fakerPT_BR.location.state({ abbreviated: true }),
      userId: connectedUser.id,
    };

    const contacts: IContactResultList = {
      items: [contact],
      page: queryContactDto.page,
      pageSize: queryContactDto.pageSize,
      total: 1,
    };

    const listItemContactPresenter = plainToInstance(
      ListItemContactPresenter,
      contacts.items,
    );

    const listContactPresenter = plainToInstance(ListContactPresenter, {
      ...contacts,
      items: listItemContactPresenter,
    });

    beforeAll(() => {
      listContactUseCase.run.mockResolvedValueOnce(contacts);
    });

    it('should return a list of contacts by user', async () => {
      const result = await contactController.list(
        queryContactDto,
        connectedUser,
      );

      expect(result).toEqual(listContactPresenter);
      expect(listContactUseCase.run).toHaveBeenCalledWith<
        [QueryContactDto, UserModel['id']]
      >(queryContactDto, connectedUser.id);
    });
  });

  describe('findById', () => {
    const contactId: Contact['_id'] = fakerPT_BR.database.mongodbObjectId();

    const contact: Contact = {
      _id: contactId,
      oldid: fakerPT_BR.number.int({ min: 0 }),
      name: fakerPT_BR.person.fullName(),
      phone: fakerPT_BR.phone.number(),
      state: fakerPT_BR.location.state({ abbreviated: true }),
      userId: connectedUser.id,
    };

    beforeAll(() => {
      findContactByIdUseCase.run.mockResolvedValueOnce(contact);
    });

    it('should find a contact by id', async () => {
      const result = await contactController.findById(contactId, connectedUser);

      expect(result).toEqual(contact);
      expect(findContactByIdUseCase.run).toHaveBeenCalledWith<[string, string]>(
        contactId,
        connectedUser.id,
      );
    });
  });

  describe('create', () => {
    const createContactDto: CreateContactDto = {
      name: fakerPT_BR.person.fullName(),
      phone: fakerPT_BR.phone.number(),
      state: fakerPT_BR.location.state({ abbreviated: true }),
    };

    const contact: Contact = {
      _id: fakerPT_BR.database.mongodbObjectId(),
      oldid: null,
      name: createContactDto.name,
      phone: createContactDto.phone,
      state: createContactDto.state,
      userId: connectedUser.id,
    };

    beforeAll(() => {
      createContactUseCase.run.mockResolvedValueOnce(contact);
    });

    it('should create a contact', async () => {
      const result = await contactController.create(
        createContactDto,
        connectedUser,
      );

      expect(result).toEqual(contact);
      expect(createContactUseCase.run).toHaveBeenCalledWith<
        [CreateContactDto, string]
      >(createContactDto, connectedUser.id);
    });
  });

  describe('integration', () => {
    // only path will be needed
    const path = join(__dirname, '../../../../test/sample.csv');
    const file: Partial<Express.Multer.File> = {
      path,
    };

    const contacts: Contact[] = [
      {
        _id: fakerPT_BR.database.mongodbObjectId(),
        name: fakerPT_BR.person.fullName(),
        oldid: fakerPT_BR.number.int({ min: 0 }),
        phone: fakerPT_BR.phone.number(),
        state: fakerPT_BR.location.state({ abbreviated: true }),
        userId: connectedUser.id,
      },
    ];

    beforeAll(() => {
      bulkCreateContactUseCase.run.mockResolvedValueOnce(contacts);
    });

    it('should read a file and return created contacts from file data', async () => {
      const result = await contactController.integration(
        file as Express.Multer.File,
        connectedUser,
      );

      expect(result).toEqual(contacts);
      expect(bulkCreateContactUseCase.run).toHaveBeenCalled();
    });
  });
});
