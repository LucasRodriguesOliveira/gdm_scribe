import { Module } from '@nestjs/common';
import { UseCaseProxyModule } from '../../infrastructure/usecase-proxy/usecase-proxy.module';
import { ContactController } from './contact/contact.controller';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { AuthController } from './auth/auth.controller';
import { UserController } from './user/user.controller';

const Kb = 1024;
const Mb = 1024 * Kb;

@Module({
  imports: [
    UseCaseProxyModule.register(),
    MulterModule.register({
      dest: join(__dirname, '../../upload'),
      limits: { fileSize: 5 * Mb },
    }),
  ],
  controllers: [ContactController, AuthController, UserController],
})
export class ControllerModule {}
