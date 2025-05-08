import api from "./api-service"

const ANALYTICS_SERVICE_URL = '/analytics'

/**
 * Types d'analyse disponibles
 */
export const AnalyticsType = {
  USERS: 'users',
  INCIDENTS: 'incidents',
  ROUTES: 'routes',
  PERFORMANCE: 'performance',
} as const;

export type AnalyticsType = typeof AnalyticsType[keyof typeof AnalyticsType];

/**
 * Périodes d'analyse disponibles
 */
export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';

/**
 * Interfaces pour le typage des réponses
 */
interface AnalyticsData {
  timestamp: string;
  value: number;
  metadata?: Record<string, any>;
}

interface DashboardData {
  summary: {
    totalUsers: number;
    activeUsers: number;
    totalIncidents: number;
    totalRoutes: number;
  };
  charts: Record<string, AnalyticsData[]>;
}

interface AnalyticsParams {
  type: AnalyticsType;
  period?: AnalyticsPeriod;
  startDate?: string;
  endDate?: string;
  groupBy?: string;
  filters?: Record<string, any>;
}

/**
 * Récupère les données d'analyse générales
 */
export const getAnalytics = async (params: AnalyticsParams): Promise<AnalyticsData[]> => {
  try {
    return await api.get(`${ANALYTICS_SERVICE_URL}/data?${new URLSearchParams(params as any)}`);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
}

/**
 * Récupère les statistiques des utilisateurs
 */
export const getUserAnalytics = async (
  period: AnalyticsPeriod = 'month',
  startDate?: string,
  endDate?: string
): Promise<AnalyticsData[]> => {
  return getAnalytics({
    type: AnalyticsType.USERS,
    period,
    startDate,
    endDate
  });
}

/**
 * Récupère les statistiques des incidents
 */
export const getIncidentAnalytics = async (
  period: AnalyticsPeriod = 'month',
  startDate?: string,
  endDate?: string,
  filters?: Record<string, any>
): Promise<AnalyticsData[]> => {
  return getAnalytics({
    type: AnalyticsType.INCIDENTS,
    period,
    startDate,
    endDate,
    filters
  });
}

/**
 * Récupère les statistiques des itinéraires
 */
export const getRouteAnalytics = async (
  period: AnalyticsPeriod = 'month',
  startDate?: string,
  endDate?: string
): Promise<AnalyticsData[]> => {
  return getAnalytics({
    type: AnalyticsType.ROUTES,
    period,
    startDate,
    endDate
  });
}

/**
 * Récupère les statistiques de performance du système
 */
export const getPerformanceAnalytics = async (
  period: AnalyticsPeriod = 'day',
  startDate?: string,
  endDate?: string
): Promise<AnalyticsData[]> => {
  return getAnalytics({
    type: AnalyticsType.PERFORMANCE,
    period,
    startDate,
    endDate
  });
}

/**
 * Récupère le tableau de bord d'analytique pour l'administrateur
 */
export const getAdminDashboardData = async (): Promise<DashboardData> => {
  return api.get(`${ANALYTICS_SERVICE_URL}/dashboard/admin`);
}

/**
 * Récupère le tableau de bord d'analytique pour l'utilisateur
 */
export const getUserDashboardData = async (): Promise<DashboardData> => {
  return api.get(`${ANALYTICS_SERVICE_URL}/dashboard/user`);
}

/**
 * Interface pour les événements d'analytique
 */
interface AnalyticsEvent {
  name: string;
  data: Record<string, any>;
  timestamp: string;
}

/**
 * Enregistre un événement d'analytique
 */
export const trackEvent = async (
  eventName: string,
  eventData: Record<string, any>
): Promise<void> => {
  const event: AnalyticsEvent = {
    name: eventName,
    data: eventData,
    timestamp: new Date().toISOString()
  };
  
  await api.post(`${ANALYTICS_SERVICE_URL}/events`, event);
}

/**
 * Interface pour les rapports
 */
interface ReportParams {
  type: string;
  params: Record<string, any>;
}

interface ReportResponse {
  id: string;
  url: string;
  generatedAt: string;
}

/**
 * Génère un rapport d'analytique exportable
 */
export const generateReport = async (
  reportType: string,
  params: Record<string, any>
): Promise<ReportResponse> => {
  const reportParams: ReportParams = {
    type: reportType,
    params
  };
  
  return api.post(`${ANALYTICS_SERVICE_URL}/reports`, reportParams);
}
