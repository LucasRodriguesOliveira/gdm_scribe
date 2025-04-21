import { ConfigModuleOptions } from '@nestjs/config';
import { appConfig } from './app.config';
import { tokenConfig } from './token.config';
import { envSchema } from './env.schema';
import { pinoConfig } from './pino.config';
import { swaggerConfig } from './swagger.config';
import { grpcConfig } from './grpc.config';

export const envConfig: ConfigModuleOptions = {
  load: [appConfig, tokenConfig, pinoConfig, swaggerConfig, grpcConfig],
  validationSchema: envSchema,
  isGlobal: true,
};
