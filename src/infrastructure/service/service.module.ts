import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { ContactService } from './contact.service';
import { grpcConfig } from '../config/grpc/grpc.config';

@Module({
  imports: [ClientsModule.registerAsync(grpcConfig)],
  providers: [ContactService],
  exports: [ContactService],
})
export class ServiceModule {}
