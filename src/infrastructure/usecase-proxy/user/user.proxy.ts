import { Provider } from '@nestjs/common';
import { FindUserByEmailProxy } from './find-user-by-email.proxy';
import { CreateUserProxy } from './create-user.proxy';

export const UserProxies: Map<symbol, Provider> = new Map([
  FindUserByEmailProxy.Entry,
  CreateUserProxy.Entry,
]);
