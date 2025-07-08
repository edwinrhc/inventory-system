import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private repo: Repository<User>
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.repo.create({...dto, password: hash});
    return this.repo.save(user);
  }

  async findByUsername(username: string):Promise<User>{
    return this.repo.findOne({where: {username}});
  }

  async findById(id: string):Promise<User>{
    return this.repo.findOne({where: {id}});
  }



}
