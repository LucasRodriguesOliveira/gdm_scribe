import { EnvMode } from './mode.enum';
import { UserConfig } from './user.interface';

export interface AppConfig {
  port: number;
  mode: EnvMode;
  user: UserConfig;
}
