import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ShareNavigationService } from './sharedNavigations.service';

@Controller()
export class ShareNavigationController {
  constructor(private readonly shareNavigationService: ShareNavigationService) {}

  @MessagePattern('shareNavigation')
  async shareNavigation(@Payload() navigationId: string) {
    return this.shareNavigationService.shareNavigation(navigationId);
  }

  @MessagePattern('getSharedNavigationDetails')
  async getSharedNavigationDetails(@Payload() sharedId: string) {
    return this.shareNavigationService.getSharedNavigationDetails(sharedId);
  }
  
  @MessagePattern('deleteSharedNavigation')
  async deleteSharedNavigation(@Payload() data: { sharedId: string}) {
    return this.shareNavigationService.deleteSharedNavigation(data.sharedId);
  }
}