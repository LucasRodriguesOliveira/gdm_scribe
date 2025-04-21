import { Provider } from '@nestjs/common';
import { IContactService } from '../../../domain/service/contact/contact-service.interface';
import { IHttpExceptionService } from '../../../domain/exception/http-exception.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { CreateContactUseCase } from '../../../application/usecase/contact/create-contact.usecase';
import { GrpcContactService } from '../../service/grpc/grpc-contact.service';
import { HttpExceptionService } from '../../http-exception/http-exception.service';
import { LoggerService } from '../../logger/logger.service';
import { Proxy } from '..';

const token = Symbol('__CREATE_CONTACT_USE_CASE__');
const provider: Provider = {
  provide: token,
  useFactory: (
    contactService: IContactService,
    exceptionService: IHttpExceptionService,
    loggerService: ILoggerService,
  ) =>
    new CreateContactUseCase(contactService, exceptionService, loggerService),
  inject: [GrpcContactService, HttpExceptionService, LoggerService],
};

export const CreateContactProxy = new Proxy(token, provider);
