import { JwtService } from '@nestjs/jwt';
import { JwtTokenService } from './jwt.service';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtPayload } from '../../../domain/auth/jwt/jwt-payload.interface';
import { fakerPT_BR } from '@faker-js/faker/.';

const jwtServiceMock = {
  signAsync: jest.fn(),
};

describe('JwtTokenService', () => {
  let jwtTokenService: JwtTokenService;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        JwtTokenService,
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    jwtTokenService = app.get<JwtTokenService>(JwtTokenService);
    jwtService = app.get<jest.Mocked<JwtService>>(JwtService);
  });

  it('should be defined', () => {
    expect(jwtService).toBeDefined();
    expect(jwtTokenService).toBeDefined();
  });

  describe('createToken', () => {
    const payload: JwtPayload = {
      email: fakerPT_BR.internet.email(),
      sub: fakerPT_BR.string.uuid(),
    };

    const token = fakerPT_BR.internet.jwt({
      payload: {
        ...payload,
      },
    });

    beforeAll(() => {
      jwtService.signAsync.mockResolvedValueOnce(token);
    });

    it('should create a JWT token for the payload (user connected)', async () => {
      const result = await jwtTokenService.createToken(payload);

      expect(result).toEqual(token);
      expect(jwtService.signAsync).toHaveBeenCalledWith<[JwtPayload]>(payload);
    });
  });
});
