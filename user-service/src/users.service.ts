import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { Role } from './entities/role.enum';
import { log } from 'console';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.findOneByEmail(createUserDto.email);
      if (existingUser) {
        throw new BadRequestException('User already exists');
      }

      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        Number(process.env.SALT),
      );

      const user = new User();
      user.username = createUserDto.username;
      user.email = createUserDto.email;
      user.password = hashedPassword;
      user.role = createUserDto.role as Role ?? Role.USER;

      await this.usersRepository.save(user);
      
      const { password, ...result } = user;

      return result as User;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating user: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<User[] | []> {
    return await this.usersRepository.find() || [];
  }

  async findOneByEmail(email: string): Promise<User | null> {
    try {
      return await this.usersRepository.findOne({ where: { email } }) || null;
    } catch (error) {
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException(`Error finding user: ${error.message}`);
    }
  }

  async findOneById(id: string): Promise<User | null> {
    try {
      const user = await this.usersRepository.findOneBy({ id });

      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      return user;
    } catch (error) {
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException(`Error finding user: ${error.message}`);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.findOneById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const updatedUser = {
        ...user,
        ...updateUserDto,
        role: updateUserDto.role as Role ?? user.role
      };

      return await this.usersRepository.save(updatedUser);
    } catch (error) {
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException(`Error updating user: ${error.message}`);
    }
  }

  async remove(id: string): Promise<string> {
    try {
      const user = await this.findOneById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      await this.usersRepository.delete({ id });
      return `User with id ${id} deleted`;
    } catch (error) {
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException(`Error deleting user: ${error.message}`);
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.usersRepository.findOne({
        where: [
          { email: email }
        ],
        select: ['id', 'password', 'email', 'username', 'role', 'authProvider', 'authProviderId', 'createdAt']
      });
      log('user', user);
      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      log('isPasswordValid', isPasswordValid);
      if (!isPasswordValid) {
        return null;
      }
      user.password = "";
      return user;
    } catch (error) {
      throw new InternalServerErrorException(`Error validating user: ${error.message}`);
    }
  }
}
