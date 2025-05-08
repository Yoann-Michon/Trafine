import { Controller, Delete, Get, Inject, Param, Patch, Post, Body, UseGuards, Request, Req } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { JwtAuthGuard, Public, Role, Roles, RolesGuard } from "utils/utils";
import { UserOwnerGuard } from "utils/utils/guards/owner.guard";

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
    constructor(
        @Inject('USER_SERVICE') private readonly userClient: ClientProxy){}

    @Post()
    @Public()
    async createUser(@Body() createUserDto: any) {
        return await firstValueFrom(this.userClient.send('createUser', createUserDto));
    }

    @Get()
    @Roles(Role.ADMIN)
    async getAllUsers(@Req() req) {
        console.log("getAllUsers - Utilisateur transmis:", req.user);
        return await firstValueFrom(this.userClient.send('findAllUsers', req.user));
    }

    @Get('id/:id')
    @Roles(Role.ADMIN, Role.USER)
    @UseGuards(UserOwnerGuard)
    async getUserById(@Param('id') id: string, @Req() req) {
        console.log("getUserById - Utilisateur transmis:", req.user);
        return await firstValueFrom(this.userClient.send('findUserById', { 
            id,
            user: req.user 
        }));
    }

    @Get('email/:email')
    @Roles(Role.ADMIN)
    async getUserByEmail(@Param('email') email: string, @Req() req) {
        console.log("getUserByEmail - Utilisateur transmis:", req.user);
        return await firstValueFrom(this.userClient.send('findUserByEmail', { 
            email,
            user: req.user 
        }));
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.USER)
    @UseGuards(UserOwnerGuard)
    async updateUser(@Param('id') id: string, @Body() updateUserDto: any, @Req() req) {
        console.log("updateUser - Utilisateur transmis:", req.user);
        return await firstValueFrom(this.userClient.send('updateUser', { 
            id, 
            updateUser: updateUserDto,
            user: req.user 
        }));
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    @UseGuards(UserOwnerGuard)
    async deleteUser(@Param('id') id: string, @Req() req) {
        console.log("deleteUser - Utilisateur transmis:", req.user);
        return await firstValueFrom(this.userClient.send('removeUser', { 
            id,
            user: req.user 
        }));
    }
}