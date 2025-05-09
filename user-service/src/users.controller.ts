import { Controller, HttpCode, HttpStatus } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Role } from './entities/role.enum';
import { log } from 'console';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('createUser')
  @HttpCode(HttpStatus.CREATED)
  async create(@Payload() createUserDto: CreateUserDto) {
    try {
      
       const user = await this.usersService.create(createUserDto);
      return {
        message: 'User created successfully',
        user,
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error creating user',
        details: error.message,
      });
    }
  }

  @MessagePattern('findAllUsers')
  async findAll(@Payload() user: Partial<User>) {

    if (user.role !== Role.ADMIN) {
      throw new RpcException({
        status: HttpStatus.FORBIDDEN,
        message: 'Access denied',
      });
    }

    try {
      const users = await this.usersService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: users.length ? 'Users retrieved successfully' : 'No users found',
        users,
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving users',
        details: error.message,
      });
    }
  }

  @MessagePattern('findUserById')
  async findOneById(@Payload() id: string) {

    try {
      const userFound = await this.usersService.findOneById(id);
      if (!userFound) {
        throw new RpcException({
          code: HttpStatus.NOT_FOUND,
          message: `User with id ${id} not found`,
        });
      }

      return {
        message: 'User found successfully',
        user: userFound,
      };
    } catch (error) {
      throw new RpcException({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving user',
        details: error.message,
      });
    }
  }

  @MessagePattern('findUserByEmail')
  async findOneByEmail(@Payload() payload: { email: string; user: Partial<User> }) {
    const { email, user } = payload;

    if (!email) {
      throw new RpcException({
        code: HttpStatus.BAD_REQUEST,
        message: 'Email is required',
      });
    }

    if (user.role !== Role.ADMIN && user.email !== email) {
      throw new RpcException({
        code: HttpStatus.FORBIDDEN,
        message: 'Access denied',
      });
    }

    try {
      const foundUser = await this.usersService.findOneByEmail(email);
      if (!foundUser) {
        throw new RpcException({
          code: HttpStatus.NOT_FOUND,
          message: `User with email ${email} not found`,
        });
      }

      return {
        message: 'User found successfully',
        foundUser,
      };
    } catch (error) {
      throw new RpcException({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving user by email',
        details: error.message,
      });
    }
  }

  @MessagePattern('updateUser')
  async update(@Payload() payload: { id: string; updateUser: UpdateUserDto; user: Partial<User> }) {
    const { id, updateUser, user } = payload;

    if (user.role !== Role.ADMIN && user.id !== id) {
      throw new RpcException({
        code: HttpStatus.FORBIDDEN,
        message: 'Access denied',
      });
    }
    if (updateUser.role && user.role !== Role.ADMIN) {
      throw new RpcException({
        code: HttpStatus.FORBIDDEN,
        message: 'Only admins can update user roles',
      });
    }

    if (updateUser.role && user.role !== Role.ADMIN && user.id === id) {
      throw new RpcException({
        code: HttpStatus.FORBIDDEN,
        message: 'You cannot update your own role',
      });
    }

    try {
      const updatedUser = await this.usersService.update(id, updateUser);
      if (!updatedUser) {
        throw new RpcException({
          code: HttpStatus.NOT_FOUND,
          message: `User with ID ${id} not found`,
        });
      }

      return {
        message: 'User updated successfully',
        updatedUser,
      };
    } catch (error) {
      throw new RpcException({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error updating user',
        details: error.message,
      });
    }
  }

  @MessagePattern('removeUser')
  async remove(@Payload() payload: { id: string; user: Partial<User> }) {
    const { id, user } = payload;

    if (!id) {
      throw new RpcException({
        code: HttpStatus.BAD_REQUEST,
        message: 'User ID is required',
      });
    }

    if (user.role !== Role.ADMIN) {
      throw new RpcException({
        code: HttpStatus.FORBIDDEN,
        message: 'Only admins can delete users',
      });
    }

    try {
      const result = await this.usersService.remove(id);
      if (!result) {
        throw new RpcException({
          code: HttpStatus.NOT_FOUND,
          message: `User with ID ${id} not found`,
        });
      }

      return {
        message: 'User removed successfully',
      };
    } catch (error) {
      throw new RpcException({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error deleting user',
        details: error.message,
      });
    }
  }

  @MessagePattern('validateUser')
  @HttpCode(HttpStatus.OK)
  async validateUser(@Payload() data: { email: string; password: string }) {
    try {
      log('Validating user:', data);
      const user = await this.usersService.validateUser(data.email, data.password);
      log('User found:', user);
      return user ;
    } catch (error) {
      throw new RpcException({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error validating user',
        details: error.message,
      });
    }
  }
}
