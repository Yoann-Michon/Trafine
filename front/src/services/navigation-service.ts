import type { GeoPoint } from "../types/incident-types"
import type { Route, RouteOptions} from "../types/navigation-types"
import api from "./api-service"


const NAVIGATION_SERVICE_URL = '/navigation'

/**
 * Récupère les itinéraires enregistrés de l'utilisateur
 */
export const getSavedRoutes = async (): Promise<Route[]> => {
  return api.get<Route[]>(`${NAVIGATION_SERVICE_URL}`)
}

/**
 * Récupère un itinéraire par son ID
 */
export const getRouteById = async (routeId: string): Promise<Route> => {
  return api.get<Route>(`${NAVIGATION_SERVICE_URL}/${routeId}`)
}

/**
 * Enregistre un nouvel itinéraire
 */
export const saveRoute = async (routeData: Partial<Route>): Promise<Route> => {
  return api.post<Route>(`${NAVIGATION_SERVICE_URL}`, routeData)
}

/**
 * Supprime un itinéraire enregistré
 */
export const deleteRoute = async (routeId: string): Promise<void> => {
  await api.delete<void>(`${NAVIGATION_SERVICE_URL}/${routeId}`)
}

/**
 * Calcule un itinéraire entre deux points à l'aide de TomTom
 * (Cette fonction utilise l'API TomTom directement, pas notre backend)
 */
export const calculateRoute = async (
  origin: GeoPoint,
  destination: GeoPoint,
  waypoints?: GeoPoint[],
  options?: RouteOptions
): Promise<any> => {
  const tomtomApiKey = import.meta.env.VITE_TOMTOM_API_KEY
  
  // Construction de l'URL pour l'API TomTom Routing
  let url = `https://api.tomtom.com/routing/1/calculateRoute/${origin.lat},${origin.lng}:${destination.lat},${destination.lng}/json`
  
  // Ajout des waypoints si spécifiés
  if (waypoints && waypoints.length > 0) {
    const waypointsString = waypoints.map(wp => `${wp.lat},${wp.lng}`).join(':')
    url = url.replace(`${origin.lat},${origin.lng}:${destination.lat},${destination.lng}`, 
                      `${origin.lat},${origin.lng}:${waypointsString}:${destination.lat},${destination.lng}`)
  }
  
  // Construction des paramètres
  const params: any = {
    key: tomtomApiKey,
    travelMode: options?.travelMode ?? 'car',
    traffic: !options?.avoidTraffic,
    avoid: []
  }
  
  // Ajout des options d'évitement
  if (options?.avoidTolls) params.avoid.push('tollRoads')
  if (options?.avoidHighways) params.avoid.push('motorways')
  if (options?.avoidFerries) params.avoid.push('ferries')
  
  // Si des options d'évitement sont spécifiées, convertir le tableau en chaîne
  if (params.avoid.length > 0) {
    params.avoid = params.avoid.join(',')
  } else {
    delete params.avoid
  }
  
  // Appel à l'API TomTom
  const response = await fetch(url + '?' + new URLSearchParams(params))
  const data = await response.json()
  
  return data
}

/**
 * Géocodage inverse - obtenir l'adresse à partir des coordonnées
 * (Cette fonction utilise l'API TomTom directement)
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<any> => {
  const tomtomApiKey = import.meta.env.VITE_TOMTOM_API_KEY
  const url = `https://api.tomtom.com/search/2/reverseGeocode/${lat},${lng}.json?key=${tomtomApiKey}`
  
  const response = await fetch(url)
  const data = await response.json()
  
  return data
}

/**
 * Recherche d'adresse/lieu (géocodage)
 * (Cette fonction utilise l'API TomTom directement)
 */
export const searchAddress = async (query: string): Promise<any> => {
  const tomtomApiKey = import.meta.env.VITE_TOMTOM_API_KEY
  const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?key=${tomtomApiKey}`
  
  const response = await fetch(url)
  const data = await response.json()
  
  return data
}