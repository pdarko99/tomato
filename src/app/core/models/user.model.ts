export interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  expiresAt: number;
  isAdmin?: boolean;
  phone?: string;
  avatar?: string;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface LoginResponse {
  userId: number;
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  expiresAt: number;
}

export interface RegisterResponse {
  userId: number;
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  expiresAt: number;
}
