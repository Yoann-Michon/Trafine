export interface User {
  id: string
  username: string
  email: string
  role: 'ADMIN' | 'USER'
  password: string
}

export interface UserCredentials {
  email: string
  password?: string
}

export interface RegisterData extends UserCredentials {
  username: string
}

export interface UserFilters {
  search?: string
  role?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}
