import { ConfigModuleOptions } from '@nestjs/config';
import { appConfig } from './app.config';
import { tokenConfig } from './token.config';
import { envSchema } from './env.schema';
import { pinoConfig } from './pino.config';
import { swaggerConfig } from './swagger.config';
import { grpcConfig } from './grpc.config';
import { rmqConfig } from './rmq.config';

export const envConfig: ConfigModuleOptions = {
  load: [
    appConfig,
    tokenConfig,
    pinoConfig,
    swaggerConfig,
    grpcConfig,
    rmqConfig,
  ],
  validationSchema: envSchema,
  isGlobal: true,
};
