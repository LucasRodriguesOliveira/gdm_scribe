import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envConfig } from './infrastructure/config/env/env.config';
import { LoggerModule } from 'nestjs-pino';
import { pinoConfig } from './infrastructure/config/pino/pino.config';
import { HttpExceptionModule } from './infrastructure/http-exception/http-exception.module';
import { LoggerModule as CustomLoggerModule } from './infrastructure/logger/logger.module';
import { UseCaseProxyModule } from './infrastructure/usecase-proxy/usecase-proxy.module';
import { ControllerModule } from './interfaces/controller/controller.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { JwtStrategyProvider } from './infrastructure/common/strategy/jwt/jwt.provider';
import { JwtModule } from '@nestjs/jwt';
import { tokenConfig } from './infrastructure/config/token/token.config';
import { LocalStrategyProvider } from './infrastructure/common/strategy/local/local.provider';

@Module({
  imports: [
    ConfigModule.forRoot(envConfig),
    JwtModule.registerAsync(tokenConfig()),
    LoggerModule.forRootAsync(pinoConfig()),
    PrismaModule,
    HttpExceptionModule,
    CustomLoggerModule,
    UseCaseProxyModule.register(),
    ControllerModule,
  ],
  providers: [JwtStrategyProvider, LocalStrategyProvider],
})
export class AppModule {}
