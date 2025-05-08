import type { RegisterData, User, UserCredentials } from "../types/user-types"
import api from "./api-service"

const AUTH_SERVICE_URL = '/auth'

/**
 * Vérifie si l'utilisateur est déjà connecté via le cookie de session
 * Le cookie est automatiquement envoyé avec la requête grâce à credentials: 'include'
 */
export const checkAuthStatus = async (): Promise<User | null> => {
  console.log('checkAuthStatus - Début de la vérification');
  
  try {
    const user = await api.get<User>(`${AUTH_SERVICE_URL}/profile`);
    console.log('checkAuthStatus - Réponse reçue:', user);
    
    return user;
  } catch (error) {
    console.error('checkAuthStatus - Échec:', error);
    return null;
  } finally {
    console.log('checkAuthStatus - Fin de la vérification');
  }
}

/**
 * Connecte un utilisateur avec ses identifiants
 * Le cookie de session est automatiquement stocké par le navigateur
 */
export const login = async (credentials: UserCredentials) => {
  console.log('login - Tentative de connexion');
  try {
    const response = await api.post<any>(`${AUTH_SERVICE_URL}/login`, credentials);
    console.log('login - Connexion réussie:', response);
    return response.user;
  } catch (error) {
    console.error('login - Échec de la connexion:', error);
    throw error;
  }
}

/**
 * Inscrit un nouvel utilisateur
 */
export const register = async (userData: RegisterData): Promise<User> => {
  console.log('register - Tentative d\'inscription');
  try {
    const response = await api.post<User>(`${AUTH_SERVICE_URL}/register`, userData);
    console.log('register - Inscription réussie:', response);
    return response;
  } catch (error) {
    console.error('register - Échec de l\'inscription:', error);
    throw error;
  }
}

/**
 * Déconnecte l'utilisateur actuel en supprimant le cookie de session
 */
export const logout = async (): Promise<void> => {
  console.log('logout - Tentative de déconnexion');
  try {
    await api.post<void>(`${AUTH_SERVICE_URL}/logout`, {});
    console.log('logout - Déconnexion réussie');
    // Le cookie sera automatiquement supprimé par le backend
  } catch (error) {
    console.error('logout - Échec de la déconnexion:', error);
    throw error;
  }
}