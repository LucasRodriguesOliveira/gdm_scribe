import { ReadStream } from 'node:fs';
import { Contact } from '../../model/contact.model';
import { ErrorResponse } from '../../types/error.interface';
import { Result } from '../../types/result';
import { IContactQuery } from './contact-query.interface';
import { IContactResultList } from './contact-result-list.interface';
import { IContactResult } from './contact-result.interface';

export interface IContactService {
  create(
    data: Partial<Contact>,
  ): Promise<Result<IContactResult, ErrorResponse>>;
  findById(id: number): Promise<Result<IContactResult, ErrorResponse>>;
  list(
    query: IContactQuery,
  ): Promise<Result<IContactResultList, ErrorResponse>>;
  bulkCreate(
    fileStream: ReadStream,
  ): Promise<Array<Result<IContactResult, ErrorResponse>>>;
}
