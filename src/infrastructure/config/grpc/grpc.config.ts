import { ClientsModuleAsyncOptions } from '@nestjs/microservices';
import { grpcContactClientProvider } from './grpc-contact.config';

export const grpcConfig: ClientsModuleAsyncOptions = {
  clients: [grpcContactClientProvider],
};
