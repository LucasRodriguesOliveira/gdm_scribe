import { IHttpExceptionService } from '../../../domain/exception/http-exception.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { UserModel } from '../../../domain/model/user.model';
import { IUserRepository } from '../../../domain/repository/user/user-repository.interface';
import { DatabaseErrors } from '../../../domain/types/database-errors.enum';
import { DatabaseError } from '../../../domain/types/database.error';

export class FindUserByEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly exceptionService: IHttpExceptionService,
    private readonly loggerService: ILoggerService,
  ) {}

  public async run(email: string): Promise<UserModel> {
    try {
      const user = await this.userRepository.findByEmail(email);

      return user;
    } catch (err) {
      const { code } = err as DatabaseError;
      const log = {
        message: `User [${email}] could not be found.`,
        error: err,
      };

      if (DatabaseErrors.NOT_FOUND === code) {
        this.loggerService.warn(
          FindUserByEmailUseCase.name,
          JSON.stringify(log),
        );
        this.exceptionService.notFound({ message: log.message });
      }

      log.message = 'Unexpected error occurred!';
      this.loggerService.error(
        FindUserByEmailUseCase.name,
        JSON.stringify(log),
      );
      this.exceptionService.internalServerError({ message: log.message });
    }
  }
}
