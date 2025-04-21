import { DynamicModule, Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { ServiceModule } from '../service/service.module';
import { HttpExceptionModule } from '../http-exception/http-exception.module';
import { ContactProxies } from './contact/contact.proxy';
import { BcryptModule } from '../service/bcrypt/bcrypt.module';
import { JwtTokenModule } from '../service/jwt/jwt.module';
import { AuthProxies } from './auth/auth.proxy';
import { UserProxies } from './user/user.proxy';
import { RepositoryModule } from '../repository/repository.module';

@Module({
  imports: [
    LoggerModule,
    ServiceModule,
    HttpExceptionModule,
    BcryptModule,
    JwtTokenModule,
    RepositoryModule,
  ],
})
export class UseCaseProxyModule {
  static register(): DynamicModule {
    return {
      module: UseCaseProxyModule,
      providers: [
        ...ContactProxies.values(),
        ...AuthProxies.values(),
        ...UserProxies.values(),
      ],
      exports: [
        ...ContactProxies.keys(),
        ...AuthProxies.keys(),
        ...UserProxies.keys(),
      ],
    };
  }
}
