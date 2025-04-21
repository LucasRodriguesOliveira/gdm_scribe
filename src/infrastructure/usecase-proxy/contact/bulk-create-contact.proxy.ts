import { Provider } from '@nestjs/common';
import { IContactService } from '../../../domain/service/contact/contact-service.interface';
import { BulkCreateContactUseCase } from '../../../application/usecase/contact/bulk-create-contact.usecase';
import { ContactService } from '../../service/contact.service';
import { Proxy } from '..';

const token = Symbol('__BULK_CREATE_CONTACT_USE_CASE__');
const provider: Provider = {
  provide: token,
  useFactory: (contactService: IContactService) =>
    new BulkCreateContactUseCase(contactService),
  inject: [ContactService],
};

export const BulkCreateContactProxy = new Proxy(token, provider);
