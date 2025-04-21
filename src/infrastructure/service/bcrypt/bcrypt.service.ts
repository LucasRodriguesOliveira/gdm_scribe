import { Injectable } from '@nestjs/common';
import { ICryptoService } from '../../../domain/auth/crypto/crypto.interface';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/types/app.interface';
import { APP_TOKEN } from '../../config/env/app.config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService implements ICryptoService {
  constructor(private readonly configService: ConfigService) {}

  public async hash(source: string): Promise<string> {
    const {
      user: {
        password: { saltRounds },
      },
    } = this.configService.get<AppConfig>(APP_TOKEN.description!);

    return bcrypt.hash(source, saltRounds);
  }

  public async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
