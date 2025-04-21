import { ICryptoService } from '../../../domain/auth/crypto/crypto.interface';
import { IHttpExceptionService } from '../../../domain/exception/http-exception.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { UserModel } from '../../../domain/model/user.model';
import { IUserRepository } from '../../../domain/repository/user/user-repository.interface';

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly exceptionService: IHttpExceptionService,
    private readonly loggerService: ILoggerService,
    private readonly cryptoService: ICryptoService,
  ) {}

  public async run(userData: Partial<UserModel>): Promise<UserModel> {
    const hashPassword = await this.cryptoService.hash(userData.password!);
    userData.password = hashPassword;

    try {
      const userCreated = await this.userRepository.create(userData);
      const log = {
        message: `User [${userCreated.id}] created!`,
        params: userData,
        result: userCreated,
      };

      this.loggerService.log(CreateUserUseCase.name, JSON.stringify(log));

      return userCreated;
    } catch (err) {
      const log = {
        message: `User could not be created`,
        params: userData,
        error: err,
      };
      this.loggerService.error(CreateUserUseCase.name, JSON.stringify(log));
      this.exceptionService.internalServerError({
        message: log.message,
      });
    }
  }
}
