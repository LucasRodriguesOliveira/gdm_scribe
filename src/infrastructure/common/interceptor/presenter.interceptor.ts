import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';

@Injectable()
export class PresenterInterceptor<T> implements NestInterceptor<T, T> {
  constructor(private readonly cls: ClassConstructor<T>) {}

  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<T> {
    return next.handle().pipe(map((data) => plainToInstance(this.cls, data)));
  }
}
