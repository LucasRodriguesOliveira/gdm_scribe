import { Observable } from 'rxjs';
import { CreateContactRequest } from './messages/create-contact.message';
import { Result } from '../../../../domain/types/result';
import { IContactResult } from '../../../../domain/service/contact/contact-result.interface';
import { ErrorResponse } from '../../../../domain/types/error.interface';
import { FindContactByIdRequest } from './messages/find-contact-by-id.message';
import { QueryContactRequest } from './messages/query-contact.message';
import { IContactResultList } from '../../../../domain/service/contact/contact-result-list.interface';

export interface GrpcContactService {
  create(
    req: CreateContactRequest,
  ): Observable<Result<IContactResult, ErrorResponse>>;
  findById(
    req: FindContactByIdRequest,
  ): Observable<Result<IContactResult, ErrorResponse>>;
  list(
    req: QueryContactRequest,
  ): Observable<Result<IContactResultList, ErrorResponse>>;
  bulkCreate(
    upstream: Observable<CreateContactRequest>,
  ): Observable<Result<IContactResult, ErrorResponse>>;
}
