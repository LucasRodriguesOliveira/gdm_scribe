import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { IQueueContactService } from '../../../domain/service/contact/queue-contact-service.interface';
import { rmqContactClientToken } from '../../config/rabbitmq/rabbitmq-contact.config';
import { RmqContactPattern } from './rabbitmq-contact-pattern.enum';
import { IntegrationProgressPayload } from '../../../domain/service/contact/integration-progress.payload';

@Injectable()
export class RabbitmqContactService
  implements OnApplicationBootstrap, IQueueContactService
{
  constructor(
    @Inject(rmqContactClientToken.description!)
    private readonly client: ClientRMQ,
  ) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }

  integrationProgress(payload: IntegrationProgressPayload): void {
    this.client.emit<string, IntegrationProgressPayload>(
      RmqContactPattern.INTEGRATION_PROGRESS,
      payload,
    );
  }
}
