import { User } from './user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string; // 3-30 chars
  password: string; // min 6 chars
}

export interface AuthResponse {
  user: User;
  token: string;
  // No refresh_token per Swagger spec
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string; // Swagger uses "password" not "new_password"
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface QRVerifyRequest {
  code: string;
}
