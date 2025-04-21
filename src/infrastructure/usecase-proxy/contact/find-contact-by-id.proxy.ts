import { Provider } from '@nestjs/common';
import { FindContactByIdUseCase } from '../../../application/usecase/contact/find-contact-by-id.usecase';
import { IContactService } from '../../../domain/service/contact/contact-service.interface';
import { IHttpExceptionService } from '../../../domain/exception/http-exception.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { ContactService } from '../../service/contact.service';
import { HttpExceptionService } from '../../http-exception/http-exception.service';
import { LoggerService } from '../../logger/logger.service';
import { Proxy } from '..';

const token = Symbol('__FIND_CONTACT_BY_ID_USE_CASE__');
const provider: Provider = {
  provide: token,
  useFactory: (
    contactService: IContactService,
    exceptionService: IHttpExceptionService,
    loggerService: ILoggerService,
  ) =>
    new FindContactByIdUseCase(contactService, exceptionService, loggerService),
  inject: [ContactService, HttpExceptionService, LoggerService],
};

export const FindContactByIdProxy = new Proxy(token, provider);
