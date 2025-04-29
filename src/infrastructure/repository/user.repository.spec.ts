import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from './user.repository';
import { UserModel } from '../../domain/model/user.model';
import { fakerPT_BR } from '@faker-js/faker/.';
import { IUserRepository } from '../../domain/repository/user/user-repository.interface';

const prismaServiceMock = {
  user: {
    create: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    findFirstOrThrow: jest.fn(),
  },
};

describe('UserRepository', () => {
  let userRepository: IUserRepository;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    userRepository = app.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  describe('create', () => {
    const userData: Partial<UserModel> = {
      name: fakerPT_BR.person.fullName(),
      email: fakerPT_BR.internet.email(),
      password: fakerPT_BR.internet.password({ length: 12 }),
    };

    const createdUser: UserModel = {
      id: fakerPT_BR.string.uuid(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      createdAt: new Date(),
    };

    beforeAll(() => {
      prismaServiceMock.user.create.mockResolvedValueOnce(createdUser);
    });

    it('should create a user', async () => {
      const result = await userRepository.create(userData);

      expect(result).toEqual(createdUser);
      expect(prismaServiceMock.user.create).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    const userId: UserModel['id'] = fakerPT_BR.string.uuid();
    const user: UserModel = {
      id: userId,
      name: fakerPT_BR.person.fullName(),
      email: fakerPT_BR.internet.email(),
      password: fakerPT_BR.internet.password({ length: 12 }),
      createdAt: fakerPT_BR.date.anytime(),
    };

    beforeAll(() => {
      prismaServiceMock.user.findUniqueOrThrow.mockResolvedValueOnce(user);
    });

    it('should return a user by id', async () => {
      const result = await userRepository.findById(userId);

      expect(result).toEqual(user);
      expect(prismaServiceMock.user.findUniqueOrThrow).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    const email: string = fakerPT_BR.internet.email();
    const user: UserModel = {
      id: fakerPT_BR.string.uuid(),
      name: fakerPT_BR.person.fullName(),
      email,
      password: fakerPT_BR.internet.password({ length: 12 }),
      createdAt: fakerPT_BR.date.anytime(),
    };

    beforeAll(() => {
      prismaServiceMock.user.findFirstOrThrow.mockResolvedValueOnce(user);
    });

    it('should return a user by email', async () => {
      const result = await userRepository.findByEmail(email);

      expect(result).toEqual(user);
      expect(prismaServiceMock.user.findFirstOrThrow).toHaveBeenCalled();
    });
  });
});
