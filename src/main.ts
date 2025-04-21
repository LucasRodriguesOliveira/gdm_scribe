import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './infrastructure/config/types/app.interface';
import { HttpExceptionFilter } from './infrastructure/common/filter/exception.filter';
import { LoggerService } from './infrastructure/logger/logger.service';
import { SwaggerConfig } from './infrastructure/config/types/swagger.interface';
import { SWAGGER_TOKEN } from './infrastructure/config/env/swagger.config';
import { APP_TOKEN } from './infrastructure/config/env/app.config';
import { SwaggerModule } from '@nestjs/swagger';
import { createSwaggerDocument } from './infrastructure/config/swagger/swagger.config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const { docs } = configService.get<SwaggerConfig>(SWAGGER_TOKEN.description!);

  SwaggerModule.setup(
    docs.path,
    app,
    createSwaggerDocument(app, configService),
  );

  const { port } = configService.getOrThrow<AppConfig>(APP_TOKEN.description!);

  app.use(helmet());

  app.useGlobalFilters(new HttpExceptionFilter(new LoggerService()));

  await app.listen(port);
}
bootstrap();
