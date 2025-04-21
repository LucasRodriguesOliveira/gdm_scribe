export interface IFormatExceptionMessage {
  message: string;
  errCode?: number;
}

export interface IHttpExceptionService {
  badRequest(data: IFormatExceptionMessage): void;
  internalServerError(data?: IFormatExceptionMessage): void;
  forbidden(data?: IFormatExceptionMessage): void;
  unauthorized(data?: IFormatExceptionMessage): void;
  notFound(data: IFormatExceptionMessage): void;
}
