import { Provider } from '@nestjs/common';
import { IQueueContactService } from '../../../domain/service/contact/queue-contact-service.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { NotifyUseCase } from '../../../application/usecase/contact/notify.usecase';
import { RabbitmqContactService } from '../../service/rabbitMQ/rabbitmq-contact.service';
import { LoggerService } from '../../logger/logger.service';
import { Proxy } from '..';

const token = Symbol('__NOTIFY_USE_CASE__');
const provider: Provider = {
  provide: token,
  useFactory: (
    queueContactService: IQueueContactService,
    loggerService: ILoggerService,
  ) => new NotifyUseCase(queueContactService, loggerService),
  inject: [RabbitmqContactService, LoggerService],
};

export const NotifyProxy = new Proxy(token, provider);
