import { Contact } from '../../../../../domain/model/contact.model';
import { UserModel } from '../../../../../domain/model/user.model';

export interface FindContactByIdRequest {
  id: Contact['_id'];
  userId: UserModel['id'];
}
