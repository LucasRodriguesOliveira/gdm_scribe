import { AppConfig } from '../types/app.interface';
import { EnvMode } from '../types/mode.enum';

export const APP_TOKEN = Symbol('app');

const DEFAULT_API_PORT = '3000';

const getSaltRounds = (
  securityLevel: string | undefined,
  mode: EnvMode,
): number => {
  if (securityLevel) {
    switch (securityLevel.toUpperCase()) {
      case 'DEFAULT':
        return 10;
      case 'HIGH':
        return 15;
      case 'HIGHEST':
        return 20;
      default:
        return 10;
    }
  }

  if (mode === EnvMode.DEVELOPMENT) {
    return 10;
  }

  if (mode === EnvMode.TEST) {
    return 5;
  }

  if (mode === EnvMode.PRODUCTION) {
    return 15;
  }

  return 10;
};

export const appConfig = (): { app: AppConfig } => {
  const {
    NODE_ENV = EnvMode.DEVELOPMENT,
    API_PORT = DEFAULT_API_PORT,
    SECURITY_LEVEL,
  } = process.env;
  let mode: EnvMode;

  switch (NODE_ENV) {
    case 'develop':
    case 'development':
      mode = EnvMode.DEVELOPMENT;
      break;
    case 'prod':
    case 'production':
      mode = EnvMode.PRODUCTION;
      break;
    case 'test':
      mode = EnvMode.TEST;
      break;
  }

  return {
    app: {
      port: parseInt(API_PORT, 10),
      mode,
      user: {
        password: {
          saltRounds: getSaltRounds(SECURITY_LEVEL, mode),
        },
      },
    },
  };
};
