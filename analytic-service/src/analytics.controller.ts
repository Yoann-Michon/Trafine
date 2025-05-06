import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AnalyticsService } from './analytics.service';

@Controller()
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  @MessagePattern('getUserStatistics')
  async getUserStatistics() {
    try {
      return await this.analyticsService.getUserStatistics();
    } catch (error) {
      this.logger.error(`Error getting user statistics: ${error.message}`, error.stack);
      throw error;
    }
  }

  @MessagePattern('getIncidentStatistics')
  async getIncidentStatistics() {
    try {
      return await this.analyticsService.getIncidentStatistics();
    } catch (error) {
      this.logger.error(`Error getting incident statistics: ${error.message}`, error.stack);
      throw error;
    }
  }

  @MessagePattern('getDailyActiveUsers')
  async getDailyActiveUsers(@Payload() data: { startDate: Date; endDate: Date }) {
    try {
      return await this.analyticsService.getDailyActiveUsers(data.startDate, data.endDate);
    } catch (error) {
      this.logger.error(`Error getting daily active users: ${error.message}`, error.stack);
      throw error;
    }
  }

  @MessagePattern('getIncidentsByRegion')
  async getIncidentsByRegion() {
    try {
      return await this.analyticsService.getIncidentsByRegion();
    } catch (error) {
      this.logger.error(`Error getting incidents by region: ${error.message}`, error.stack);
      throw error;
    }
  }

  @MessagePattern('getIncidentTrends')
  async getIncidentTrends(@Payload() data: { period: string; type?: string }) {
    try {
      return await this.analyticsService.getIncidentTrends(data.period, data.type);
    } catch (error) {
      this.logger.error(`Error getting incident trends: ${error.message}`, error.stack);
      throw error;
    }
  }

  @MessagePattern('getUserEngagementMetrics')
  async getUserEngagementMetrics() {
    try {
      return await this.analyticsService.getUserEngagementMetrics();
    } catch (error) {
      this.logger.error(`Error getting user engagement metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  @MessagePattern('getSystemPerformanceMetrics')
  async getSystemPerformanceMetrics(@Payload() data: { timeframe: string }) {
    try {
      return await this.analyticsService.getSystemPerformanceMetrics(data.timeframe);
    } catch (error) {
      this.logger.error(`Error getting system performance metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  @MessagePattern('getIncidentResolutionStats')
  async getIncidentResolutionStats() {
    try {
      return await this.analyticsService.getIncidentResolutionStats();
    } catch (error) {
      this.logger.error(`Error getting incident resolution stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  @MessagePattern('getDashboardSummary')
  async getDashboardSummary() {
    try {
      return await this.analyticsService.getDashboardSummary();
    } catch (error) {
      this.logger.error(`Error getting dashboard summary: ${error.message}`, error.stack);
      throw error;
    }
  }
}