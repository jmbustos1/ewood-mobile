import { create } from 'zustand'
import type { User } from '../../domain/entities'
import { AuthRepositoryImpl } from '../../data/repositories/AuthRepositoryImpl'
import type { LoginParams, RegisterParams } from '../../domain/repositories'

const repo = new AuthRepositoryImpl()

// Traduce el string de error que devuelve el backend a un mensaje amigable
// en espanol chileno neutro (sin voseo argentino). El backend responde con
// {"error": "..."} y a veces con {"message": "..."} — probamos ambos.
function friendlyError(e: any, action: 'login' | 'register' | 'forgot'): string {
  const code: string = e?.response?.data?.error ?? e?.response?.data?.message ?? ''
  const c = code.toLowerCase().trim()

  if (action === 'register') {
    if (c === 'email already in use') return 'Este correo ya tiene una cuenta. Inicia sesión o recupera tu contraseña.'
    if (c.includes('invalid') || c.includes('bad request')) return 'Datos inválidos. Revisa los campos.'
    return 'No pudimos crear tu cuenta. Intenta nuevamente.'
  }
  if (action === 'login') {
    if (c.includes('invalid credentials') || c === 'unauthorized') return 'Correo o contraseña incorrectos.'
    return 'No pudimos iniciar sesión. Intenta nuevamente.'
  }
  return 'No pudimos enviar el correo. Intenta nuevamente.'
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isNewUser: boolean
  error: string | null

  login: (params: LoginParams) => Promise<void>
  register: (params: RegisterParams) => Promise<void>
  completeOnboarding: () => void
  logout: () => Promise<void>
  loadMe: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isNewUser: false,
  error: null,

  login: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const { user } = await repo.login(params)
      set({ user, isAuthenticated: true })
    } catch (e: any) {
      set({ error: friendlyError(e, 'login') })
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const { user } = await repo.register(params)
      set({ user, isAuthenticated: true, isNewUser: true })
    } catch (e: any) {
      set({ error: friendlyError(e, 'register') })
    } finally {
      set({ isLoading: false })
    }
  },

  completeOnboarding: () => set({ isNewUser: false }),

  logout: async () => {
    await repo.logout()
    set({ user: null, isAuthenticated: false })
  },

  loadMe: async () => {
    try {
      const user = await repo.me()
      set({ user, isAuthenticated: true })
    } catch {
      set({ user: null, isAuthenticated: false })
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null })
    try {
      await repo.forgotPassword(email)
    } catch (e: any) {
      set({ error: friendlyError(e, 'forgot') })
    } finally {
      set({ isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
