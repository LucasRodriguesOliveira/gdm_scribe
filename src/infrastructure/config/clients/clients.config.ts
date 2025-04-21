import { ClientsModuleAsyncOptions } from '@nestjs/microservices';
import { grpcContactClientProvider } from '../grpc/grpc-contact.config';
import { rmqContactClientProvider } from '../rabbitmq/rabbitmq-contact.config';

export const clientConfig: ClientsModuleAsyncOptions = {
  clients: [grpcContactClientProvider, rmqContactClientProvider],
};
