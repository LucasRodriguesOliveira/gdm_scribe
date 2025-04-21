import { ReadStream } from 'node:fs';
import { Contact } from '../../model/contact.model';
import { ErrorResponse } from '../../types/error.interface';
import { Result } from '../../types/result';
import { IContactQuery } from './contact-query.interface';
import { IContactResultList } from './contact-result-list.interface';
import { IContactResult } from './contact-result.interface';
import { UserModel } from '../../model/user.model';

export interface IContactService {
  create(
    data: Partial<Contact>,
    userId: UserModel['id'],
  ): Promise<Result<IContactResult, ErrorResponse>>;
  findById(
    contactId: Contact['id'],
    userId: UserModel['id'],
  ): Promise<Result<IContactResult, ErrorResponse>>;
  list(
    query: IContactQuery,
    userId: UserModel['id'],
  ): Promise<Result<IContactResultList, ErrorResponse>>;
  bulkCreate(
    fileStream: ReadStream,
    userId: UserModel['id'],
  ): Promise<Array<Result<IContactResult, ErrorResponse>>>;
}
