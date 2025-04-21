import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModuleAsyncParams } from 'nestjs-pino';
import { PinoConfig } from '../types/pino.interface';
import { PINOCONFIG_TOKEN } from '../env/pino.config';

export const pinoConfig = (): LoggerModuleAsyncParams => ({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const { level, transport } = configService.get<PinoConfig>(
      PINOCONFIG_TOKEN.description,
    );

    return {
      pinoHttp: {
        level,
        transport,
      },
    };
  },
});
