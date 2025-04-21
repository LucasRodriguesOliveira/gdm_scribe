import { ConfigService } from '@nestjs/config';
import { ClientsProviderAsyncOptions, Transport } from '@nestjs/microservices';
import { RMQConfig } from '../types/rmq.interface';
import { rmqConfigToken } from '../env/rmq.config';

export const rmqContactClientToken = Symbol('RMQ__CONTACT_SERVICE');

export const rmqContactClientProvider: ClientsProviderAsyncOptions = {
  name: rmqContactClientToken.description!,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const rmq = configService.getOrThrow<RMQConfig>(
      rmqConfigToken.description!,
    );

    return {
      transport: Transport.RMQ,
      options: {
        urls: [rmq.url],
        queue: rmq.queue,
        queueOptions: {
          durable: true,
        },
      },
    };
  },
};
