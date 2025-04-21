import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { IContactService } from '../../domain/service/contact/contact-service.interface';
import { GrpcContactService } from '../grpc/service/contact/contact-service.grpc';
import { grpcContactClientToken } from '../config/grpc/grpc-contact.config';
import { ClientGrpc } from '@nestjs/microservices';
import { GRPCService } from './service.enum';
import { IContactResult } from '../../domain/service/contact/contact-result.interface';
import { ErrorResponse } from '../../domain/types/error.interface';
import { Result } from '../../domain/types/result';
import { firstValueFrom, lastValueFrom, ReplaySubject, toArray } from 'rxjs';
import { IContactQuery } from '../../domain/service/contact/contact-query.interface';
import { IContactResultList } from '../../domain/service/contact/contact-result-list.interface';
import { Contact } from '../../domain/model/contact.model';
import { ReadStream } from 'fs';
import { parse } from 'csv-parse';

@Injectable()
export class ContactService implements OnModuleInit, IContactService {
  private grpcContactService: GrpcContactService;

  constructor(
    @Inject(grpcContactClientToken.description!)
    private readonly clientGrpc: ClientGrpc,
  ) {}

  onModuleInit() {
    this.grpcContactService = this.clientGrpc.getService<GrpcContactService>(
      GRPCService.CONTACT,
    );
  }

  findById(id: number): Promise<Result<IContactResult, ErrorResponse>> {
    return firstValueFrom(this.grpcContactService.findById({ id }));
  }

  list(
    query: IContactQuery,
  ): Promise<Result<IContactResultList, ErrorResponse>> {
    return firstValueFrom(this.grpcContactService.list(query));
  }

  create(data: Contact): Promise<Result<IContactResult, ErrorResponse>> {
    return firstValueFrom(this.grpcContactService.create(data));
  }

  async bulkCreate(
    fileStream: ReadStream,
  ): Promise<Array<Result<IContactResult, ErrorResponse>>> {
    const csvParser = parse({
      delimiter: ',',
      from_line: 2,
      trim: true,
    });

    const subject = new ReplaySubject<Contact>();
    fileStream.pipe(csvParser);

    csvParser.on('data', (row: string[]) => {
      const [id, name, phone, state] = row;

      const contactData: Contact = {
        id: parseInt(id),
        name,
        phone,
        state,
      };

      subject.next(contactData);
    });

    csvParser.on('end', () => {
      subject.complete();
    });

    csvParser.on('error', (err) => {
      subject.error(err);
    });

    return lastValueFrom(
      this.grpcContactService
        .bulkCreate(subject.asObservable())
        .pipe(toArray()),
    );
  }
}
