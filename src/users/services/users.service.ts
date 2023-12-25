import { Injectable } from '@nestjs/common';
import dbClient from '../../db';
import { v4 } from 'uuid';

import { User } from '../models';

@Injectable()
export class UsersService {
  private readonly users: Record<string, User>;

  constructor() {
    this.users = {};
  }

  async findOne(userName: string): Promise<User> {
    const user = await dbClient('users').where('name', userName).first();
    return user;
  }

  async createOne({ name, password }: User): Promise<User> {
    // const id = v4();
    const newUser = (await dbClient('users')
      .insert({ name, password })
      .returning('*')) as unknown as User;

    return newUser;
  }
}
