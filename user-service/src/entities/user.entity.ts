import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn} from 'typeorm';
import { Role } from './role.enum';
import { Exclude } from 'class-transformer';

@Entity('users')
@Unique(['email', 'username'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @Column({ nullable: false, select: false })
  password: string;

  @Column({ nullable: false, unique: true})
  email: string;

  @Column({ nullable: false })
  username: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ nullable: true })
  authProvider: string;

  @Column({ nullable: true })
  authProviderId: string;

  @CreateDateColumn()
  createdAt: Date;
}

