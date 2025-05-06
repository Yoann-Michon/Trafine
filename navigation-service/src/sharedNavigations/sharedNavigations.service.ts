import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SharedNavigation } from '../entities/shareNavigation.entity';
import { NavigationsService } from '../navigations.service';

@Injectable()
export class ShareNavigationService {
  private readonly logger = new Logger(ShareNavigationService.name);

  constructor(
    @InjectRepository(SharedNavigation)
    private readonly sharedNavigationRepository: Repository<SharedNavigation>,
    private readonly navigationsService: NavigationsService,
  ) {}

  async shareNavigation(navigationId: string): Promise<SharedNavigation> {
    const navigation = await this.navigationsService.findOne(navigationId);
    if (!navigation) {
      throw new HttpException('Navigation not found', HttpStatus.NOT_FOUND);
    }

    const existingShare = await this.sharedNavigationRepository.findOne({
      where: { navigationId },
    });

    if (existingShare) {
      this.logger.warn(`Navigation ${navigationId} is already shared.`);
      return existingShare; 
    }

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const sharedNavigation = this.sharedNavigationRepository.create({
        navigationId: navigation.id,
        expiresAt: expiresAt,
        url: `/shared-route/${navigation.id}`
      });

      return await this.sharedNavigationRepository.save(sharedNavigation);
    } catch (error) {
      this.logger.error('Error sharing navigation:', error);
      throw new HttpException('Failed to share navigation', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getSharedNavigationDetails(sharedId: string): Promise<any> {
    const sharedNavigation = await this.sharedNavigationRepository.findOne({
      where: { id: sharedId },
      relations: ['navigation'],
    });

    if (!sharedNavigation) {
      throw new HttpException('Shared navigation not found', HttpStatus.NOT_FOUND);
    }

    // Vérifier si le lien a expiré
    if (new Date() > sharedNavigation.expiresAt) {
      // Supprimer le lien expiré
      await this.sharedNavigationRepository.remove(sharedNavigation);
      throw new HttpException('Shared navigation link has expired', HttpStatus.GONE);
    }

    return sharedNavigation;
  }

  async deleteSharedNavigation(sharedId: string): Promise<void> {
    const sharedNavigation = await this.sharedNavigationRepository.findOne({
      where: { id: sharedId },
      relations: ['navigation'],
    });

    if (!sharedNavigation) {
      throw new HttpException('Shared navigation not found', HttpStatus.NOT_FOUND);
    }

    try {
      await this.sharedNavigationRepository.remove(sharedNavigation);
    } catch (error) {
      this.logger.error('Error deleting shared navigation:', error);
      throw new HttpException('Failed to delete shared navigation', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}