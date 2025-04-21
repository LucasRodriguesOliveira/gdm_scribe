import { Provider } from '@nestjs/common';
import { FindContactByIdProxy } from './find-contact-by-id.proxy';
import { ListContactProxy } from './list-contact.proxy';
import { CreateContactProxy } from './create-contact.proxy';
import { BulkCreateContactProxy } from './bulk-create-contact.proxy';
import { NotifyProxy } from './notify.proxy';

export const ContactProxies: Map<symbol, Provider> = new Map([
  FindContactByIdProxy.Entry,
  ListContactProxy.Entry,
  CreateContactProxy.Entry,
  BulkCreateContactProxy.Entry,
  NotifyProxy.Entry,
]);
