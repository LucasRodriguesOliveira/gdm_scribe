import { Contact } from '../../model/contact.model';

export interface IContactQuery {
  name?: Contact['name'];
  state?: Contact['state'];
  page: number;
  pageSize: number;
}
