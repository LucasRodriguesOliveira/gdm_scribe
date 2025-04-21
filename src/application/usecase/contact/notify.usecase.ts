import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { IQueueContactService } from '../../../domain/service/contact/queue-contact-service.interface';

export class NotifyUseCase {
  constructor(
    private readonly queueContactService: IQueueContactService,
    private readonly loggerService: ILoggerService,
  ) {}

  public run() {
    this.queueContactService.test();
    this.loggerService.log(NotifyUseCase.name, 'Message sent');
  }
}
