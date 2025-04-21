import { UserModel } from '../../model/user.model';

export interface IUserRepository {
  create(userData: Partial<UserModel>): Promise<UserModel>;
  findById(userId: string): Promise<UserModel>;
  findByEmail(email: string): Promise<UserModel>;
}
