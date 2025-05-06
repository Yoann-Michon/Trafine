import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Controller('navigation')
export class NavigationController {
    constructor(
        @Inject('NAVIGATION_SERVICE') private readonly navigationClient: ClientProxy
    ) { }

    @Post()
    async createNavigation(@Body() createNavigationDto: any) {
        return await firstValueFrom(this.navigationClient.send('createNavigation', createNavigationDto));
    }

    @Get()
    async getAllNavigations() {
        return await firstValueFrom(this.navigationClient.send('findAllNavigations', {}));
    }

    @Get('id/:id')
    async getNavigationById(@Param('id') id: string) {
        return await firstValueFrom(this.navigationClient.send('findOneNavigation', { id }));
    }

    @Patch(':id')
    async updateNavigation(@Param('id') id: string, @Body() updateNavigationDto: any) {
        return await firstValueFrom(this.navigationClient.send('updateNavigation', { id, ...updateNavigationDto }));
    }

    @Delete(':id')
    async deleteNavigation(@Param('id') id: string) {
        return await firstValueFrom(this.navigationClient.send('removeNavigation', { id }));
    }

    @Post('calculateRoute')
    async calculateRoute(@Body() data: any) {
        return await firstValueFrom(this.navigationClient.send('calculateRoute', data));
    }

    @Post('recalculateRoute')
    async recalculateRoute(@Body() data: any) {
        return await firstValueFrom(this.navigationClient.send('recalculateRoute', data));
    }

    @Post('searchAddress')
    async searchAddress(@Body() data: { query: string }) {
        return await firstValueFrom(this.navigationClient.send('searchAddress', data));
    }

    @Post('reverseGeocode')
    async reverseGeocode(@Body() data: { lat: string; lon: string }) {
        return await firstValueFrom(this.navigationClient.send('reverseGeocode', data));
    }

    @Get('getRouteDetails')
    async getRouteDetails(@Query('routeId') routeId: string) {
        return await firstValueFrom(this.navigationClient.send('getRouteDetails', routeId));
    }

    @Post('getUserRoutes')
    async getUserRoutes(@Body() data: { userId: string }) {
        return await firstValueFrom(this.navigationClient.send('getUserRoutes', data.userId));
    }

    @Post('getRecentRoutes')
    async getRecentRoutes(@Body() data: { userId: string; limit?: number }) {
        return await firstValueFrom(this.navigationClient.send('getRecentRoutes', data));
    }

    @Post('saveCalculatedRoute')
    async saveCalculatedRoute(@Body() data: any) {
        return await firstValueFrom(this.navigationClient.send('saveCalculatedRoute', data));
    }

    @Post('getOfflineRouteData')
    async getOfflineRouteData(@Body() data: { userId: string; navigationIds?: string[] }) {
        return await firstValueFrom(this.navigationClient.send('getOfflineRouteData', data));
    }

    @Post('share')
    async shareNavigation(@Body('navigationId') navigationId: string) {
        return await firstValueFrom(this.navigationClient.send('shareNavigation', navigationId));
    }

    @Get('shared/:sharedId')
    async getSharedNavigationDetails(@Param('sharedId') sharedId: string) {
        return await firstValueFrom(this.navigationClient.send('getSharedNavigationDetails', sharedId));
    }

    @Delete('shared/:sharedId')
    async deleteSharedNavigation(@Param('sharedId') sharedId: string) {
        return await firstValueFrom(this.navigationClient.send('deleteSharedNavigation', { sharedId }));
    }

}
