import { Controller, Delete, Get, Inject, Param, Patch, Post, Body } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Controller('users')
export class UserController {
    constructor(
        @Inject('USER_SERVICE') private readonly userClient: ClientProxy){}

    @Post()
    async createUser(@Body() createUserDto: any) {
        return await firstValueFrom(this.userClient.send('createUser', createUserDto));
    }

    @Get()
    async getAllUsers() {
        return await firstValueFrom(this.userClient.send('findAllUsers', {}));
    }

    @Get('id/:id')
    async getUserById(@Param('id') id: string) {
        return await firstValueFrom(this.userClient.send('findUserById', { id }));
    }

    @Get('email/:email')
    async getUserByEmail(@Param('email') email: string) {
        return await firstValueFrom(this.userClient.send('findUserByEmail', { email }));
    }

    @Patch(':id')
    async updateUser(@Param('id') id: string, @Body() updateUserDto: any) {
        return await firstValueFrom(this.userClient.send('updateUser', { id, ...updateUserDto }));
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: string) {
        return await firstValueFrom(this.userClient.send('removeUser', { id }));
    }
}