import { Contact } from '../../model/contact.model';

export interface IContactResultList {
  items: Contact[];
  page: number;
  pageSize: number;
  total: number;
}
