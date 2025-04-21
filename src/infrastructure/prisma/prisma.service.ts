import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/types/app.interface';
import { APP_TOKEN } from '../config/env/app.config';
import { EnvMode } from '../config/types/mode.enum';
import { PrismaClient } from '../../../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {
    super({
      log:
        configService.getOrThrow<AppConfig>(APP_TOKEN.description!).mode ===
        EnvMode.DEVELOPMENT
          ? ['query', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
