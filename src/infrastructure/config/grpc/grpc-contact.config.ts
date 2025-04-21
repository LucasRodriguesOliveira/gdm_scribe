import { ConfigService } from '@nestjs/config';
import {
  ClientsProviderAsyncOptions,
  GrpcOptions,
  Transport,
} from '@nestjs/microservices';
import { join } from 'path';
import { GRPCConfig } from '../types/grpc.interface';
import { grpcConfigToken } from '../env/grpc.config';

export const grpcContactClientToken = Symbol('GRPC__CONTACT_PACKAGE__');

export const grpcContactClientOptions: GrpcOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'contact',
    protoPath: join(__dirname, '../../grpc/contact.proto'),
  },
};

export const grpcContactClientProvider: ClientsProviderAsyncOptions = {
  name: grpcContactClientToken.description!,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const { url } = configService.getOrThrow<GRPCConfig>(
      grpcConfigToken.description!,
    );

    grpcContactClientOptions.options.url = url;

    return grpcContactClientOptions;
  },
};
