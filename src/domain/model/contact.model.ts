import { UserModel } from './user.model';

export class Contact {
  id: number;
  name: string;
  phone: string;
  state: string;
  userId: UserModel['id'];
}
