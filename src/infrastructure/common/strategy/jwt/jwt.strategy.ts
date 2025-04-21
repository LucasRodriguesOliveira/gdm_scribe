import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ILoggerService } from '../../../../domain/logger/logger-service.interface';
import { IHttpExceptionService } from '../../../../domain/exception/http-exception.interface';
import { TokenConfig } from '../../../config/types/token.interface';
import { JWT_CONFIGTOKEN } from '../../../config/env/token.config';
import { JwtPayload } from '../../../../domain/auth/jwt/jwt-payload.interface';
import { FindUserByEmailProxy } from '../../../usecase-proxy/user/find-user-by-email.proxy';
import { FindUserByEmailUseCase } from '../../../../application/usecase/user/find-user-by-email.usecase';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(FindUserByEmailProxy.Token)
    private readonly findUserByEmailUseCase: FindUserByEmailUseCase,
    private readonly configService: ConfigService,
    private readonly loggerService: ILoggerService,
    private readonly exceptionService: IHttpExceptionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<TokenConfig>(
        JWT_CONFIGTOKEN.description!,
      ).secret,
    });
  }

  public async validate(payload: JwtPayload) {
    try {
      const user = await this.findUserByEmailUseCase.run(payload.email);

      return user;
    } catch (err) {
      this.loggerService.warn(
        JwtStrategy.name,
        JSON.stringify({
          message: 'User not found',
          error: err,
        }),
      );
      this.exceptionService.unauthorized({
        message: 'User not found',
      });
    }
  }
}
