import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { IQueueContactService } from '../../../domain/service/contact/queue-contact-service.interface';
import { rmqContactClientToken } from '../../config/rabbitmq/rabbitmq-contact.config';
import { firstValueFrom } from 'rxjs';

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

  async test() {
    const result = await firstValueFrom(
      this.client.send<string>('notification', 'Hello from scribe'),
    );

    console.log(result);
  }
}
