import { Test, TestingModule } from '@nestjs/testing';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { IQueueContactService } from '../../../domain/service/contact/queue-contact-service.interface';
import { NotifyUseCase } from './notify.usecase';
import { RabbitmqContactService } from '../../../infrastructure/service/rabbitMQ/rabbitmq-contact.service';
import { LoggerService } from '../../../infrastructure/logger/logger.service';
import { IntegrationProgressPayload } from '../../../domain/service/contact/integration-progress.payload';
import { faker } from '@faker-js/faker';

interface NotifyLogOptions {
  should: boolean;
  message: string;
}

const queueContactServiceMock = {
  integrationProgress: jest.fn(),
};

const loggerServiceMock = {
  log: jest.fn(),
};

describe('NotifyUseCase', () => {
  let notifyUseCase: NotifyUseCase;
  let queueContactService: jest.Mocked<IQueueContactService>;
  let loggerService: jest.Mocked<ILoggerService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: NotifyUseCase,
          inject: [RabbitmqContactService, LoggerService],
          useFactory: (
            queueContactService: IQueueContactService,
            loggerService: ILoggerService,
          ) => new NotifyUseCase(queueContactService, loggerService),
        },
        {
          provide: RabbitmqContactService,
          useValue: queueContactServiceMock,
        },
        {
          provide: LoggerService,
          useValue: loggerServiceMock,
        },
      ],
    }).compile();

    notifyUseCase = app.get<NotifyUseCase>(NotifyUseCase);
    queueContactService = app.get(RabbitmqContactService);
    loggerService = app.get(LoggerService);
  });

  it('should be defined', () => {
    expect(loggerService).toBeDefined();
    expect(queueContactService).toBeDefined();
    expect(notifyUseCase).toBeDefined();
  });

  describe('integrationProgress', () => {
    const payload: IntegrationProgressPayload = {
      progress: faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
      userId: faker.string.uuid(),
    };

    const logOptions: NotifyLogOptions = {
      message: faker.string.sample(10),
      should: true,
    };

    it('should send a message about the integration progress to rmq service', () => {
      notifyUseCase.integrationProgress(payload, logOptions);

      expect(queueContactService.integrationProgress).toHaveBeenCalledWith<
        [IntegrationProgressPayload]
      >(payload);
      expect(loggerService.log).toHaveBeenCalledWith<[string, string]>(
        NotifyUseCase.name,
        logOptions.message,
      );
    });
  });
});
