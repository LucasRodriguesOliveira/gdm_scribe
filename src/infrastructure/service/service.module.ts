import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { GrpcContactService } from './grpc/grpc-contact.service';
import { clientConfig } from '../config/clients/clients.config';
import { RabbitmqContactService } from './rabbitMQ/rabbitmq-contact.service';

@Module({
  imports: [ClientsModule.registerAsync(clientConfig)],
  providers: [GrpcContactService, RabbitmqContactService],
  exports: [GrpcContactService, RabbitmqContactService],
})
export class ServiceModule {}
