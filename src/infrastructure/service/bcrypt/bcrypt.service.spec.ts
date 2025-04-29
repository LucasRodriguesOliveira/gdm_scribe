import { fakerPT_BR } from '@faker-js/faker/.';
import { ICryptoService } from '../../../domain/auth/crypto/crypto.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { BcryptService } from './bcrypt.service';
import { ConfigService } from '@nestjs/config';

const configServiceMock = {
  get: jest.fn().mockImplementationOnce(() => {
    return {
      user: {
        password: {
          saltRounds: 10,
        },
      },
    };
  }),
};

const hashedPassword = 'hashed_password';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValueOnce('hashed_password'),
  compare: jest.fn().mockResolvedValueOnce(true),
}));

describe('BcryptService', () => {
  let bcryptService: ICryptoService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        BcryptService,
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    bcryptService = app.get<BcryptService>(BcryptService);
  });

  it('should be defined', () => {
    expect(bcryptService).toBeDefined();
  });

  describe('hash', () => {
    const source: string = fakerPT_BR.internet.password({ length: 10 });

    it('should encrypt a password and return a hash', async () => {
      const result = await bcryptService.hash(source);

      expect(result).toEqual(hashedPassword);
      expect(configServiceMock.get).toHaveBeenCalled();
    });
  });

  describe('compare', () => {
    const password: string = fakerPT_BR.internet.password({ length: 10 });
    const hash: string = hashedPassword;

    it('should compare a user password with a hashed password', async () => {
      const result = await bcryptService.compare(password, hash);

      expect(result).toBe(true);
    });
  });
});
