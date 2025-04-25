import { Provider } from '@nestjs/common';
import { FindUserByEmailProxy } from './find-user-by-email.proxy';
import { CreateUserProxy } from './create-user.proxy';
import { FindUserByIdProxy } from './find-user-by-id.proxy';

export const UserProxies: Map<symbol, Provider> = new Map([
  FindUserByEmailProxy.Entry,
  CreateUserProxy.Entry,
  FindUserByIdProxy.Entry,
]);
