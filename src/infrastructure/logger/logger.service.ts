import { Injectable, Logger } from '@nestjs/common';
import { ILoggerService } from 'src/domain/logger/logger-service.interface';

@Injectable()
export class LoggerService extends Logger implements ILoggerService {
  debug(context: string, message: string) {
    const { NODE_ENV } = process.env;

    if (NODE_ENV.toLowerCase() !== 'production') {
      super.debug(`${message}`, context);
    }
  }

  log(context: string, message: string) {
    super.log(`${message}`, context);
  }

  error(context: string, message: string, trace?: string) {
    super.error(`${message}`, trace, context);
  }

  warn(context: string, message: string) {
    super.warn(`${message}`, context);
  }

  verbose(context: string, message: string) {
    const { NODE_ENV } = process.env;

    if (NODE_ENV.toLowerCase() !== 'production') {
      super.verbose(`[VERBOSE]: ${message}`, context);
    }
  }
}
