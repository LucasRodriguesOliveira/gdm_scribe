import { IHttpExceptionService } from '../../../domain/exception/http-exception.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { Contact } from '../../../domain/model/contact.model';
import { UserModel } from '../../../domain/model/user.model';
import { IContactService } from '../../../domain/service/contact/contact-service.interface';

interface QueryContact {
  name?: string;
  state?: string;
}

export class ListContactUseCase {
  constructor(
    private readonly contactService: IContactService,
    private readonly exceptionService: IHttpExceptionService,
    private readonly loggerService: ILoggerService,
  ) {}

  public async run(
    query: QueryContact,
    userId: UserModel['id'],
  ): Promise<Contact[]> {
    const result = await this.contactService.list(query, userId);

    if (result?.error) {
      this.loggerService.error(
        ListContactUseCase.name,
        JSON.stringify(result.error),
      );

      this.exceptionService.internalServerError({
        message: result.error.message,
      });
    }

    return result.value.contacts;
  }
}
