import { Module } from '@nestjs/common';
import { HttpExceptionService } from './http-exception.service';

@Module({
  providers: [HttpExceptionService],
  exports: [HttpExceptionService],
})
export class HttpExceptionModule {}
