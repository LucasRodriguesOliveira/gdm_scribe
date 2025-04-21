import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { IContactService } from '../../../domain/service/contact/contact-service.interface';
import { IGrpcContactService } from '../../grpc/service/contact/contact-service.grpc';
import { grpcContactClientToken } from '../../config/grpc/grpc-contact.config';
import { ClientGrpc } from '@nestjs/microservices';
import { GRPCService } from '../grpc-service.enum';
import { IContactResult } from '../../../domain/service/contact/contact-result.interface';
import { ErrorResponse } from '../../../domain/types/error.interface';
import { Result } from '../../../domain/types/result';
import { firstValueFrom, lastValueFrom, ReplaySubject, toArray } from 'rxjs';
import { IContactQuery } from '../../../domain/service/contact/contact-query.interface';
import { IContactResultList } from '../../../domain/service/contact/contact-result-list.interface';
import { Contact } from '../../../domain/model/contact.model';
import { ReadStream } from 'fs';
import { parse } from 'csv-parse';
import { UserModel } from '../../../domain/model/user.model';

@Injectable()
export class GrpcContactService implements OnModuleInit, IContactService {
  private grpcContactService: IGrpcContactService;

  constructor(
    @Inject(grpcContactClientToken.description!)
    private readonly clientGrpc: ClientGrpc,
  ) {}

  onModuleInit() {
    this.grpcContactService = this.clientGrpc.getService<IGrpcContactService>(
      GRPCService.CONTACT,
    );
  }

  findById(
    contactId: Contact['id'],
    userId: UserModel['id'],
  ): Promise<Result<IContactResult, ErrorResponse>> {
    return firstValueFrom(
      this.grpcContactService.findById({ id: contactId, userId }),
    );
  }

  list(
    query: IContactQuery,
    userId: UserModel['id'],
  ): Promise<Result<IContactResultList, ErrorResponse>> {
    return firstValueFrom(
      this.grpcContactService.list({
        ...query,
        userId,
      }),
    );
  }

  create(data: Contact): Promise<Result<IContactResult, ErrorResponse>> {
    return firstValueFrom(this.grpcContactService.create(data));
  }

  async bulkCreate(
    fileStream: ReadStream,
    userId: UserModel['id'],
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
        userId,
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
