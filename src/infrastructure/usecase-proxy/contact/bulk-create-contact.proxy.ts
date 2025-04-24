import { Provider } from '@nestjs/common';
import { IContactService } from '../../../domain/service/contact/contact-service.interface';
import { BulkCreateContactUseCase } from '../../../application/usecase/contact/bulk-create-contact.usecase';
import { GrpcContactService } from '../../service/grpc/grpc-contact.service';
import { Proxy } from '..';
import { IHttpExceptionService } from '../../../domain/exception/http-exception.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { NotifyUseCase } from '../../../application/usecase/contact/notify.usecase';
import { NotifyProxy } from './notify.proxy';
import { HttpExceptionService } from '../../http-exception/http-exception.service';
import { LoggerService } from '../../logger/logger.service';

const token = Symbol('__BULK_CREATE_CONTACT_USE_CASE__');
const provider: Provider = {
  provide: token,
  useFactory: (
    contactService: IContactService,
    notifyUseCase: NotifyUseCase,
    exceptionService: IHttpExceptionService,
    loggerService: ILoggerService,
  ) =>
    new BulkCreateContactUseCase(
      contactService,
      notifyUseCase,
      exceptionService,
      loggerService,
    ),
  inject: [
    GrpcContactService,
    NotifyProxy.Token,
    HttpExceptionService,
    LoggerService,
  ],
};

export const BulkCreateContactProxy = new Proxy(token, provider);
