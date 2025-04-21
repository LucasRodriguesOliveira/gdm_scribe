import { DynamicModule, Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { ServiceModule } from '../service/service.module';
import { HttpExceptionModule } from '../http-exception/http-exception.module';
import { ContactProxies } from './contact/contact.proxy';

@Module({
  imports: [LoggerModule, ServiceModule, HttpExceptionModule],
})
export class UseCaseProxyModule {
  static register(): DynamicModule {
    return {
      module: UseCaseProxyModule,
      providers: [...ContactProxies.values()],
      exports: [...ContactProxies.keys()],
    };
  }
}
