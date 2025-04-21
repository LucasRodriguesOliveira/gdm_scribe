import { Injectable } from '@nestjs/common';
import { IJwtService } from '../../../domain/auth/jwt/jwt.interface';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../../domain/auth/jwt/jwt-payload.interface';

@Injectable()
export class JwtTokenService implements IJwtService {
  constructor(private readonly jwtService: JwtService) {}

  public async createToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
