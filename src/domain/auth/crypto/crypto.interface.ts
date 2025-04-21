export interface ICryptoService {
  hash(source: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}
