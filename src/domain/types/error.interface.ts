import { ErrorCode } from './error-code.enum';

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
}
