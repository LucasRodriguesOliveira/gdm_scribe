import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  IFormatExceptionMessage,
  IHttpExceptionService,
} from 'src/domain/exception/http-exception.interface';

@Injectable()
export class HttpExceptionService implements IHttpExceptionService {
  badRequest(data: IFormatExceptionMessage): void {
    throw new BadRequestException(data);
  }

  forbidden(data?: IFormatExceptionMessage): void {
    throw new ForbiddenException(data);
  }

  internalServerError(data?: IFormatExceptionMessage): void {
    throw new InternalServerErrorException(data);
  }

  unauthorized(data?: IFormatExceptionMessage): void {
    throw new UnauthorizedException(data);
  }

  notFound(data: IFormatExceptionMessage): void {
    throw new NotFoundException(data);
  }
}
