import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { SwaggerConfig } from '../types/swagger.interface';
import { SWAGGER_TOKEN } from '../env/swagger.config';

export function createSwaggerDocument(
  app: INestApplication,
  configService: ConfigService,
): OpenAPIObject {
  const { api } = configService.get<SwaggerConfig>(SWAGGER_TOKEN.description);

  const config = new DocumentBuilder()
    .setTitle(api.name)
    .setDescription(api.description)
    .setVersion(api.version)
    .addBearerAuth({
      type: 'http',
      description: 'Token JWT',
      bearerFormat: 'JWT',
      scheme: 'bearer',
    });

  return SwaggerModule.createDocument(app, config.build());
}
