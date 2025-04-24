import { UserModel } from './user.model';

export class Contact {
  _id: string;
  oldid: number;
  name: string;
  phone: string;
  state: string;
  userId: UserModel['id'];
}
