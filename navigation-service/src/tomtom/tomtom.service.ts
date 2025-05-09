import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TomtomService {
  async calculateRoutes(waypoints: { lat: number; lon: number; name?: string }[],options: {
    maxAlternatives?: number;
    avoidTolls?: boolean;
    avoidHighways?: boolean;
    traffic?: boolean;
  }){
    try {
      const locations = waypoints.map(wp => `${wp.lat},${wp.lon}`).join(':');
      
      const maxAlternatives = options.maxAlternatives ?? 3;

      let params = new URLSearchParams({
        key: process.env.TOMTOM_API_KEY!,
        traffic: (options.traffic !== false).toString(),
        travelMode: 'car',
        maxAlternatives: Math.min(maxAlternatives, 5).toString(),
      });

      if (options.avoidTolls) {
        params.append('avoid', 'tollRoads');
      }
      
      if (options.avoidHighways) {
        params.append('avoid', 'motorways');
      }
      
      const url = `${process.env.TOMTOM_URL}/routing/1/calculateRoute/${locations}/json?${params.toString()}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          {
            status: error.response.status,
            error: 'Erreur lors du calcul d\'itinéraire TomTom',
            message: error.response.data.message ?? 'Une erreur est survenue',
          },
          error.response.status,
        );
      }
      throw new HttpException(
        'Erreur de communication avec l\'API TomTom',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async calculateRoute(waypoints: { lat: number; lon: number; name?: string }[], options?: any){
    return this.calculateRoutes(waypoints, { maxAlternatives: 1, ...options });
  }

  async searchPlaces(query: string, lat?: number, lon?: number, radius?: number){
    try {
      let url = `${process.env.TOMTOM_URL}/search/2/search/${encodeURIComponent(query)}.json?key=${process.env.TOMTOM_API_KEY}`;
      
      if (lat && lon) {
        url += `&lat=${lat}&lon=${lon}`;
        
        if (radius) {
          url += `&radius=${radius}`;
        }
      }
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          {
            status: error.response.status,
            error: 'Erreur lors de la recherche de lieux TomTom',
            message: error.response.data.message ?? 'Une erreur est survenue',
          },
          error.response.status,
        );
      }
      throw new HttpException(
        'Erreur de communication avec l\'API TomTom',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}