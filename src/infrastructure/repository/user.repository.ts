import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repository/user/user-repository.interface';
import { PrismaService } from '../prisma/prisma.service';
import { UserModel } from '../../domain/model/user.model';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async create(userData: UserModel): Promise<UserModel> {
    return this.prisma.user.create({
      data: userData,
    });
  }

  public async findById(userId: string): Promise<UserModel> {
    return this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });
  }

  public async findByEmail(email: string): Promise<UserModel> {
    return this.prisma.user.findFirstOrThrow({
      where: {
        email,
      },
    });
  }
}
