import { Contact } from '../../../../../domain/model/contact.model';
import { UserModel } from '../../../../../domain/model/user.model';

export interface CreateContactRequest {
  oldid?: Contact['oldid'];
  name: Contact['name'];
  phone: Contact['phone'];
  state: Contact['state'];
  userId: UserModel['id'];
}
