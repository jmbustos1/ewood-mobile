import type { AuthRepository, LoginParams, RegisterParams, AuthTokens } from '../../domain/repositories'
import type { User } from '../../domain/entities'
import { apiClient } from '../api/apiClient'
import { tokenStorage } from '../storage/tokenStorage'

export class AuthRepositoryImpl implements AuthRepository {
  async login(params: LoginParams) {
    const { data } = await apiClient.post('/auth/login', {
      email: params.email,
      password: params.password,
    })
    const tokens: AuthTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    }
    await tokenStorage.saveTokens(tokens.accessToken, tokens.refreshToken)
    return { user: this.mapUser(data.user), tokens }
  }

  async register(params: RegisterParams) {
    const { data } = await apiClient.post('/auth/register', {
      name: params.name,
      email: params.email,
      password: params.password,
      accepted_terms_version: params.acceptedTermsVersion,
      accepted_privacy_version: params.acceptedPrivacyVersion,
    })
    const tokens: AuthTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    }
    await tokenStorage.saveTokens(tokens.accessToken, tokens.refreshToken)
    return { user: this.mapUser(data.user), tokens }
  }

  async logout() {
    try { await apiClient.post('/auth/logout') } catch {}
    await tokenStorage.clearTokens()
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const { data } = await apiClient.post('/auth/refresh', { refresh_token: refreshToken })
    return { accessToken: data.access_token, refreshToken: data.refresh_token }
  }

  async me(): Promise<User> {
    const { data } = await apiClient.get('/auth/me')
    return this.mapUser(data)
  }

  async forgotPassword(email: string) {
    await apiClient.post('/auth/forgot-password', { email })
  }

  private mapUser(raw: any): User {
    return {
      id: raw.id,
      name: raw.name,
      email: raw.email,
      preferredCityId: raw.preferred_city_id,
      createdAt: raw.created_at,
    }
  }
}
