import { PinoConfig } from '../types/pino.interface';

export const PINOCONFIG_TOKEN = Symbol('pino');

export const pinoConfig = (): { pino: PinoConfig } => {
  const { NODE_ENV } = process.env;

  const isProduction = NODE_ENV?.toLowerCase() === 'production';

  return {
    pino: {
      level: isProduction ? 'info' : 'debug',
      transport: isProduction ? undefined : { target: 'pino-pretty' },
    },
  };
};
