import { ReadStream } from 'fs';
import { IContactService } from '../../../domain/service/contact/contact-service.interface';
import { Contact } from '../../../domain/model/contact.model';
import { IHttpExceptionService } from '../../../domain/exception/http-exception.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { UserModel } from '../../../domain/model/user.model';
import { NotifyUseCase } from './notify.usecase';

export class BulkCreateContactUseCase {
  constructor(
    private readonly contactService: IContactService,
    private readonly notifyUseCase: NotifyUseCase,
    private readonly exceptionService: IHttpExceptionService,
    private readonly loggerService: ILoggerService,
  ) {}

  public async run(fileStream: ReadStream, userId: UserModel['id']) {
    const result = await this.contactService.bulkCreate(fileStream, userId);
    const contacts: Contact[] = [];

    this.notifyUseCase.integrationProgress(
      { userId, progress: 0 },
      { should: true, message: 'Starting integration...' },
    );

    let progress = 0.0;
    let count = 0;

    for (const item of result) {
      count++;
      progress = count / result.length;

      this.notifyUseCase.integrationProgress({ userId, progress });

      if (item?.error) {
        this.loggerService.error(
          BulkCreateContactUseCase.name,
          JSON.stringify(item.error),
        );
      } else {
        contacts.push(item.value.contact);
      }
    }

    if (contacts.length === 0) {
      this.loggerService.error(
        BulkCreateContactUseCase.name,
        'No item could be integrated',
      );
      this.exceptionService.internalServerError();
    }

    this.notifyUseCase.integrationProgress(
      { userId, progress: 100 },
      {
        should: true,
        message: `Integration of [${contacts.length}] contacts completed!`,
      },
    );

    return contacts;
  }
}
