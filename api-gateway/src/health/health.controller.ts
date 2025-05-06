import { Controller, Get, HttpStatus } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  async checkHealth() {
    try {
      const healthResults = await Promise.all([
        this.checkServiceHealth('auth-service', 'http://auth-service:4001/health'),
        this.checkServiceHealth('event-service', 'http://event-service:4002/health'),
        this.checkServiceHealth('user-service', 'http://user-service:4004/health'),
        this.checkServiceHealth('notification-service', 'http://notification-service:4006/health'),
      ]);

      console.table(healthResults, ['service', 'status', 'message']);

      return {
        statusCode: HttpStatus.OK,
        message: 'Health check of all services',
        services: healthResults,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error during health check',
        details: error?.message ?? 'Unknown error',
      };
    }
  }

  private async checkServiceHealth(serviceName: string, serviceUrl: string) {
    try {
      const response = await fetch(serviceUrl);
      
      if (response.ok) {
        const data = await response.json();
        return {
          service: serviceName,
          status: 'healthy 🟢',
          message: 'Service is healthy',
          response: data,
        };
      } else {
        return {
          service: serviceName,
          status: 'unhealthy 🔴',
          message: `Service at ${serviceUrl} is not healthy`,
        };
      }
    } catch (error) {
      return {
        service: serviceName,
        status: 'unhealthy 🔴',
        message: error?.message ?? 'Unknown error',
      };
    }
  }
}
