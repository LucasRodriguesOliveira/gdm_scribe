import { Provider } from '@nestjs/common';
import { LoginProxy } from './login.proxy';

export const AuthProxies: Map<symbol, Provider> = new Map([LoginProxy.Entry]);
