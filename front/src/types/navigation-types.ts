import type { GeoPoint } from "./incident-types";


/**
 * Interface pour un itinéraire
 */
export interface Route {
  id: string;
  name?: string;
  origin: GeoPoint & { address?: string };
  destination: GeoPoint & { address?: string };
  waypoints?: (GeoPoint & { address?: string })[];
  distance: number; // en mètres
  duration: number; // en secondes
  createdAt: string;
  updatedAt: string;
  userId: string;
}

/**
 * Options pour le calcul d'itinéraire
 */
export interface RouteOptions {
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  avoidFerries?: boolean;
  avoidTraffic?: boolean;
  travelMode?: 'car' | 'pedestrian' | 'bicycle';
}

/**
 * Mise à jour de position
 */
export interface LocationUpdate {
  userId: string;
  position: GeoPoint;
  heading?: number;
  speed?: number;
  timestamp: number;
}

/**
 * État de navigation
 */
export interface NavigationState {
  active: boolean;
  currentRoute?: Route;
  currentPosition?: GeoPoint;
  remainingDistance?: number;
  remainingDuration?: number;
  nextInstruction?: RouteInstruction;
  eta?: string;
}

/**
 * Instruction de navigation
 */
export interface RouteInstruction {
  maneuver: string;
  distance: number;
  duration: number;
  position: GeoPoint;
  instruction: string;
}
