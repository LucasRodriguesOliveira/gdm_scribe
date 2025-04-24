import { UserModel } from '../../model/user.model';

export interface IntegrationProgressPayload {
  userId: UserModel['id'];
  progress: number;
}
