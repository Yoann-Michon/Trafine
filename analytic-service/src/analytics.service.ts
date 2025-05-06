import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('INCIDENT_SERVICE') private readonly incidentClient: ClientProxy,
    // Ajoutez ici d'autres services dont vous avez besoin
  ) {}

  async getUserStatistics() {
    try {
      const totalUsers = await firstValueFrom(this.userClient.send('countUsers', {}));
      const activeUsers = await firstValueFrom(this.userClient.send('countActiveUsers', {}));
      const newUsersThisMonth = await firstValueFrom(this.userClient.send('countNewUsers', { period: 'month' }));
      
      return {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        activePercentage: (activeUsers / totalUsers) * 100,
        growthRate: await this.calculateUserGrowthRate()
      };
    } catch (error) {
      this.logger.error(`Error in getUserStatistics: ${error.message}`);
      throw error;
    }
  }

  async getIncidentStatistics() {
    try {
      const totalIncidents = await firstValueFrom(this.incidentClient.send('countIncidents', {}));
      const activeIncidents = await firstValueFrom(this.incidentClient.send('countActiveIncidents', {}));
      const resolvedIncidents = await firstValueFrom(this.incidentClient.send('countResolvedIncidents', {}));
      
      return {
        totalIncidents,
        activeIncidents,
        resolvedIncidents,
        resolutionRate: (resolvedIncidents / totalIncidents) * 100,
        incidentsByType: await this.getIncidentsByType()
      };
    } catch (error) {
      this.logger.error(`Error in getIncidentStatistics: ${error.message}`);
      throw error;
    }
  }

  async getDailyActiveUsers(startDate: Date, endDate: Date) {
    try {
      return await firstValueFrom(
        this.userClient.send('getDailyActiveUsers', { startDate, endDate })
      );
    } catch (error) {
      this.logger.error(`Error in getDailyActiveUsers: ${error.message}`);
      throw error;
    }
  }

  async getIncidentsByRegion() {
    try {
      return await firstValueFrom(
        this.incidentClient.send('getIncidentsByRegion', {})
      );
    } catch (error) {
      this.logger.error(`Error in getIncidentsByRegion: ${error.message}`);
      throw error;
    }
  }

  async getIncidentTrends(period: string, type?: string) {
    try {
      return await firstValueFrom(
        this.incidentClient.send('getIncidentTrends', { period, type })
      );
    } catch (error) {
      this.logger.error(`Error in getIncidentTrends: ${error.message}`);
      throw error;
    }
  }

  async getUserEngagementMetrics() {
    try {
      const averageSessionTime = await firstValueFrom(
        this.userClient.send('getAverageSessionTime', {})
      );
      
      const interactionRate = await firstValueFrom(
        this.userClient.send('getInteractionRate', {})
      );
      
      const retentionRate = await firstValueFrom(
        this.userClient.send('getRetentionRate', {})
      );
      
      return {
        averageSessionTime,
        interactionRate,
        retentionRate,
        userActivity: await this.getUserActivityDistribution()
      };
    } catch (error) {
      this.logger.error(`Error in getUserEngagementMetrics: ${error.message}`);
      throw error;
    }
  }

  async getSystemPerformanceMetrics(timeframe: string) {
    try {
      // Cette méthode pourrait être connectée à un service de monitoring
      // comme Prometheus ou utiliser des métriques stockées dans la base de données
      return {
        apiLatency: await this.getApiLatencyMetrics(timeframe),
        errorRate: await this.getErrorRateMetrics(timeframe),
        throughput: await this.getThroughputMetrics(timeframe),
        resourceUtilization: await this.getResourceUtilizationMetrics(timeframe)
      };
    } catch (error) {
      this.logger.error(`Error in getSystemPerformanceMetrics: ${error.message}`);
      throw error;
    }
  }

  async getIncidentResolutionStats() {
    try {
      const averageResolutionTime = await firstValueFrom(
        this.incidentClient.send('getAverageResolutionTime', {})
      );
      
      const resolutionByType = await firstValueFrom(
        this.incidentClient.send('getResolutionByType', {})
      );
      
      return {
        averageResolutionTime,
        resolutionByType,
        resolutionTrend: await this.getResolutionTrend()
      };
    } catch (error) {
      this.logger.error(`Error in getIncidentResolutionStats: ${error.message}`);
      throw error;
    }
  }

  async getDashboardSummary() {
    try {
      const userStats = await this.getUserStatistics();
      const incidentStats = await this.getIncidentStatistics();
      const performanceMetrics = await this.getSystemPerformanceMetrics('day');
      
      return {
        userStats: {
          totalUsers: userStats.totalUsers,
          activeUsers: userStats.activeUsers,
          newUsersThisMonth: userStats.newUsersThisMonth
        },
        incidentStats: {
          totalIncidents: incidentStats.totalIncidents,
          activeIncidents: incidentStats.activeIncidents,
          resolvedIncidents: incidentStats.resolvedIncidents
        },
        performanceStatus: this.getSystemStatusSummary(performanceMetrics),
        recentActivity: await this.getRecentActivity()
      };
    } catch (error) {
      this.logger.error(`Error in getDashboardSummary: ${error.message}`);
      throw error;
    }
  }

  // Méthodes d'aide privées
  private async calculateUserGrowthRate() {
    // Implémentation...
    return 5.7; // Exemple de taux de croissance
  }

  private async getIncidentsByType() {
    // Implémentation...
    return {
      'accident': 145,
      'breakdown': 89,
      'construction': 76,
      'hazard': 54,
      'other': 23
    };
  }

  private async getUserActivityDistribution() {
    // Implémentation...
    return {
      'reporting': 45,
      'confirming': 30,
      'browsing': 20,
      'other': 5
    };
  }

  private async getApiLatencyMetrics(timeframe: string) {
    // Implémentation...
    return [
      { timestamp: '2023-05-01T00:00:00', value: 120 },
      { timestamp: '2023-05-01T01:00:00', value: 115 },
      // Plus de données...
    ];
  }

  private async getErrorRateMetrics(timeframe: string) {
    // Implémentation...
    return [
      { timestamp: '2023-05-01T00:00:00', value: 0.5 },
      { timestamp: '2023-05-01T01:00:00', value: 0.3 },
      // Plus de données...
    ];
  }

  private async getThroughputMetrics(timeframe: string) {
    // Implémentation...
    return [
      { timestamp: '2023-05-01T00:00:00', value: 256 },
      { timestamp: '2023-05-01T01:00:00', value: 312 },
      // Plus de données...
    ];
  }

  private async getResourceUtilizationMetrics(timeframe: string) {
    // Implémentation...
    return {
      cpu: 65,
      memory: 72,
      disk: 48,
      network: 33
    };
  }

  private async getResolutionTrend() {
    // Implémentation...
    return [
      { month: 'Jan', value: 87 },
      { month: 'Feb', value: 83 },
      { month: 'Mar', value: 91 },
      // Plus de données...
    ];
  }

  private getSystemStatusSummary(metrics: any) {
    // Implémentation...
    return {
      status: 'healthy',
      warnings: 2,
      errors: 0
    };
  }

  private async getRecentActivity() {
    // Implémentation...
    return [
      { type: 'newIncident', timestamp: '2023-05-01T14:32:00', details: 'Accident reported on Highway 101' },
      { type: 'userRegistration', timestamp: '2023-05-01T14:30:00', details: 'New user registered' },
      // Plus d'activités...
    ];
  }
}