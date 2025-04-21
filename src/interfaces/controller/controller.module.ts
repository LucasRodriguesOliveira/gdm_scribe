import { Module } from '@nestjs/common';
import { UseCaseProxyModule } from '../../infrastructure/usecase-proxy/usecase-proxy.module';
import { ContactController } from './contact/contact.controller';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [
    UseCaseProxyModule.register(),
    MulterModule.register({ dest: join(__dirname, '../../upload') }),
  ],
  controllers: [ContactController, AuthController],
})
export class ControllerModule {}
