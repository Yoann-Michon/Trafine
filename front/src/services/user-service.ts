import type { User } from "../types/user-types"
import api from "./api-service"


const USER_SERVICE_URL = '/users'

/**
 * Récupère la liste des utilisateurs avec filtrage et pagination
 */
export const getUsers = async (): Promise<User[]> => {
  const response=await api.get<any>(`${USER_SERVICE_URL}`)
  return response.users;
}

/**
 * Récupère un utilisateur par son ID
 */
export const getUserById = async (userId: string): Promise<User> => {
  return await api.get(`${USER_SERVICE_URL}/${userId}`)
}

/**
 * Crée un nouvel utilisateur (fonction admin)
 */
export const createUser = async (userData: Partial<User>): Promise<User> => {
  return await api.post(`${USER_SERVICE_URL}`, userData)
}

/**
 * Met à jour un utilisateur existant
 */
export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
  return await api.patch(`${USER_SERVICE_URL}/${userId}`, userData)
}

/**
 * Supprime un utilisateur
 */
export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`${USER_SERVICE_URL}/${userId}`)
}