import { create } from 'zustand'
import type { Config } from '../../domain/entities'
import { ConfigRepositoryImpl } from '../../data/repositories/ConfigRepositoryImpl'

const repo = new ConfigRepositoryImpl()

// Defaults embebidos: se usan al arrancar antes del primer fetch y como
// fallback si /api/config falla (sin romper UI).
const DEFAULT_CONFIG: Config = {
  pricing: {
    pricePerMinuteClp: 120,
    taxRate: 0.19,
    currency: 'CLP',
  },
  app: {
    minSupportedVersion: '1.0.0',
  },
}

interface ConfigState {
  config: Config
  isLoading: boolean
  error: string | null

  loadConfig: () => Promise<void>
  clearError: () => void
}

export const useConfigStore = create<ConfigState>((set) => ({
  config: DEFAULT_CONFIG,
  isLoading: false,
  error: null,

  loadConfig: async () => {
    set({ isLoading: true, error: null })
    try {
      const config = await repo.getConfig()
      set({ config })
    } catch (e: any) {
      set({ error: e?.response?.data?.error ?? 'Error al cargar configuración' })
    } finally {
      set({ isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
