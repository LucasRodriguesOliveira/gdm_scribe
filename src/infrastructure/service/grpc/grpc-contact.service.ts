import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { IContactService } from '../../../domain/service/contact/contact-service.interface';
import { IGrpcContactService } from '../../grpc/service/contact/contact-service.grpc';
import { grpcContactClientToken } from '../../config/grpc/grpc-contact.config';
import { ClientGrpc } from '@nestjs/microservices';
import { GRPCService } from './grpc-service.enum';
import { IContactResult } from '../../../domain/service/contact/contact-result.interface';
import { ErrorResponse } from '../../../domain/types/error.interface';
import { Result } from '../../../domain/types/result';
import {
  firstValueFrom,
  from,
  lastValueFrom,
  mergeMap,
  ReplaySubject,
  toArray,
} from 'rxjs';
import { IContactQuery } from '../../../domain/service/contact/contact-query.interface';
import { IContactResultList } from '../../../domain/service/contact/contact-result-list.interface';
import { Contact } from '../../../domain/model/contact.model';
import { ReadStream } from 'fs';
import { parse } from 'csv-parse';
import { UserModel } from '../../../domain/model/user.model';
import { RabbitmqContactService } from '../rabbitMQ/rabbitmq-contact.service';

@Injectable()
export class GrpcContactService implements OnModuleInit, IContactService {
  private grpcContactService: IGrpcContactService;

  constructor(
    @Inject(grpcContactClientToken.description!)
    private readonly clientGrpc: ClientGrpc,
    private readonly queueContactService: RabbitmqContactService,
  ) {}

  onModuleInit() {
    this.grpcContactService = this.clientGrpc.getService<IGrpcContactService>(
      GRPCService.CONTACT,
    );
  }

  public async findById(
    contactId: Contact['_id'],
    userId: UserModel['id'],
  ): Promise<Result<IContactResult, ErrorResponse>> {
    return firstValueFrom(
      this.grpcContactService.findById({ id: contactId, userId }),
    );
  }

  public async list(
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

  public async create(
    data: Contact,
    userId: UserModel['id'],
  ): Promise<Result<IContactResult, ErrorResponse>> {
    return firstValueFrom(
      this.grpcContactService.create({
        ...data,
        userId,
      }),
    );
  }

  private extractRowData(
    row: string[],
    userId: UserModel['id'],
  ): Omit<Contact, '_id'> {
    const [id, name, phone, state] = row;

    return {
      oldid: parseInt(id),
      name,
      phone,
      state,
      userId,
    };
  }

  public async bulkCreate(
    fileStream: ReadStream,
    userId: UserModel['id'],
  ): Promise<Array<Result<IContactResult, ErrorResponse>>> {
    const csvParser = parse({
      delimiter: ',',
      from_line: 2,
      trim: true,
    });

    fileStream.pipe(csvParser);

    const subjects: ReplaySubject<Omit<Contact, '_id'>>[] = [];
    let subject = new ReplaySubject<Omit<Contact, '_id'>>();

    let count = 0;
    const maxItems = 1000;

    csvParser.on('data', (row: string[]) => {
      const contactData = this.extractRowData(row, userId);

      subject.next(contactData);
      count++;

      if (count >= maxItems) {
        subject.complete();
        subjects.push(subject);
        subject = new ReplaySubject<Omit<Contact, '_id'>>();
        count = 0;
      }
    });

    return new Promise((resolve, reject) => {
      csvParser.on('end', async () => {
        if (count > 0) {
          subject.complete();
          subjects.push(subject);
        }

        try {
          const results = await lastValueFrom(
            from(subjects).pipe(
              mergeMap((subject, index) => {
                const progress = index / subjects.length;

                this.queueContactService.integrationProgress({
                  progress,
                  userId,
                });

                return this.grpcContactService
                  .bulkCreate(subject.asObservable())
                  .pipe(toArray());
              }),
              toArray(),
            ),
          );

          resolve(results.flat());
        } catch (err) {
          reject(err);
        }
      });

      csvParser.on('error', (err) => {
        subjects.forEach((subject) => {
          subject.error(err);
          reject(err);
        });
      });
    });
  }
}
