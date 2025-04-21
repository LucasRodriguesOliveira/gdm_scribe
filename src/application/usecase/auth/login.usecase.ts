import { ICryptoService } from '../../../domain/auth/crypto/crypto.interface';
import { JwtPayload } from '../../../domain/auth/jwt/jwt-payload.interface';
import { IJwtService } from '../../../domain/auth/jwt/jwt.interface';
import { IHttpExceptionService } from '../../../domain/exception/http-exception.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { UserModel } from '../../../domain/model/user.model';
import { FindUserByEmailUseCase } from '../user/find-user-by-email.usecase';

export class LoginUseCase {
  constructor(
    private readonly findUserByEmailUseCase: FindUserByEmailUseCase,
    private readonly cryptoService: ICryptoService,
    private readonly jwtService: IJwtService,
    private readonly loggerService: ILoggerService,
    private readonly exceptionService: IHttpExceptionService,
  ) {}

  public async checkUser(email: string, password: string): Promise<UserModel> {
    const user = await this.findUserByEmailUseCase.run(email);

    const match = await this.cryptoService.compare(password, user.password);

    if (!match) {
      delete user.password; // not cool logging in console the user password

      const log = {
        message: `Invalid credentials.`,
        params: {
          email,
        },
        user,
      };
      this.loggerService.warn(LoginUseCase.name, JSON.stringify(log));
      this.exceptionService.unauthorized({ message: log.message });
    }

    return user;
  }

  public async login({ id, email }: UserModel): Promise<string> {
    const payload: JwtPayload = {
      sub: id,
      email,
    };

    return this.jwtService.createToken(payload);
  }
}
