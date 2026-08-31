import type { User } from '../entities'

export interface LoginParams {
  email: string
  password: string
}

export interface RegisterParams {
  name: string
  email: string
  password: string
  // Versiones de documentos legales aceptados (opcional para compatibilidad
  // con backends viejos). El backend persiste en user_consents.
  acceptedTermsVersion?: string
  acceptedPrivacyVersion?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthRepository {
  login(params: LoginParams): Promise<{ user: User; tokens: AuthTokens }>
  register(params: RegisterParams): Promise<{ user: User; tokens: AuthTokens }>
  logout(): Promise<void>
  refreshToken(refreshToken: string): Promise<AuthTokens>
  me(): Promise<User>
  forgotPassword(email: string): Promise<void>
}
