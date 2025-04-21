import 'express-serve-static-core';
import { UserModel } from '../../../domain/model/user.model';

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserModel;
  }
}
