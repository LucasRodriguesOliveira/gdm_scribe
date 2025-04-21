import { Contact } from '../../../../../domain/model/contact.model';
import { UserModel } from '../../../../../domain/model/user.model';

export interface QueryContactRequest {
  name?: Contact['name'];
  state?: Contact['state'];
  userId: UserModel['id'];
}
