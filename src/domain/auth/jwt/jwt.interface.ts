import { JwtPayload } from './jwt-payload.interface';

export interface IJwtService {
  createToken(payload: JwtPayload): Promise<string>;
}
