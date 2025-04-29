import { ClientRMQ } from '@nestjs/microservices';
import { RabbitmqContactService } from './rabbitmq-contact.service';
import { Test, TestingModule } from '@nestjs/testing';
import { rmqContactClientToken } from '../../config/rabbitmq/rabbitmq-contact.config';
import { IntegrationProgressPayload } from '../../../domain/service/contact/integration-progress.payload';
import { faker } from '@faker-js/faker';
import { RmqContactPattern } from './rabbitmq-contact-pattern.enum';

const clientMock = {
  connect: jest.fn(),
  emit: jest.fn(),
};

describe('RabbitmqContactService', () => {
  let rabbitmqContactService: RabbitmqContactService;
  let client: jest.Mocked<ClientRMQ>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        RabbitmqContactService,
        { provide: rmqContactClientToken.description!, useValue: clientMock },
      ],
    }).compile();

    rabbitmqContactService = app.get<RabbitmqContactService>(
      RabbitmqContactService,
    );
    client = app.get<jest.Mocked<ClientRMQ>>(
      rmqContactClientToken.description!,
    );
  });

  it('should be defined', () => {
    expect(client).toBeDefined();
    expect(rabbitmqContactService).toBeDefined();
  });

  describe('onApplicationBootstrap', () => {
    it('should connect to RMQ server', async () => {
      await rabbitmqContactService.onApplicationBootstrap();

      expect(client.connect).toHaveBeenCalled();
    });
  });

  describe('integrationProgress', () => {
    const payload: IntegrationProgressPayload = {
      progress: faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
      userId: faker.string.uuid(),
    };

    it('should emit a message to the Message Broker server', () => {
      rabbitmqContactService.integrationProgress(payload);

      expect(client.emit).toHaveBeenCalledWith<
        [RmqContactPattern, IntegrationProgressPayload]
      >(RmqContactPattern.INTEGRATION_PROGRESS, payload);
    });
  });
});
