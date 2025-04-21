import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envConfig } from './infrastructure/config/env/env.config';
import { LoggerModule } from 'nestjs-pino';
import { pinoConfig } from './infrastructure/config/pino/pino.config';
import { HttpExceptionModule } from './infrastructure/http-exception/http-exception.module';
import { LoggerModule as CustomLoggerModule } from './infrastructure/logger/logger.module';
import { UseCaseProxyModule } from './infrastructure/usecase-proxy/usecase-proxy.module';
import { ControllerModule } from './interfaces/controller/controller.module';

@Module({
  imports: [
    ConfigModule.forRoot(envConfig),
    LoggerModule.forRootAsync(pinoConfig()),
    HttpExceptionModule,
    CustomLoggerModule,
    UseCaseProxyModule.register(),
    ControllerModule,
  ],
})
export class AppModule {}
