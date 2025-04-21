import { IHttpExceptionService } from '../../../domain/exception/http-exception.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { Contact } from '../../../domain/model/contact.model';
import { UserModel } from '../../../domain/model/user.model';
import { IContactService } from '../../../domain/service/contact/contact-service.interface';
import { ErrorCode } from '../../../domain/types/error-code.enum';

export class FindContactByIdUseCase {
  constructor(
    private readonly contactService: IContactService,
    private readonly exceptionService: IHttpExceptionService,
    private readonly loggerService: ILoggerService,
  ) {}

  public async run(
    contactId: Contact['id'],
    userId: UserModel['id'],
  ): Promise<Contact> {
    const result = await this.contactService.findById(contactId, userId);

    if (result?.error) {
      const message = result.error.message;

      if (result.error.code === ErrorCode.NOT_FOUND) {
        this.exceptionService.notFound({ message });
      }

      this.loggerService.error(
        FindContactByIdUseCase.name,
        JSON.stringify(result.error),
      );

      this.exceptionService.internalServerError({ message });
    }

    return result.value.contact;
  }
}
