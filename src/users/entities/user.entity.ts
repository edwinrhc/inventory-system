import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../role.enum';


@Entity('users')
export class User {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({unique: true})
  username: string;

  @Column()
  password: string;

  @Column({type: 'enum', enum: Role, default: Role.VENDOR})
  role: Role;

}
