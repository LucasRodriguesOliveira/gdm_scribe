interface PasswordConfig {
  saltRounds: number;
}

export interface UserConfig {
  password: PasswordConfig;
}
