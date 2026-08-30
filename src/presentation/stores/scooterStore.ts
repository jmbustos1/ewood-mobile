import { create } from 'zustand'
import type { Scooter, City } from '../../domain/entities'
import { ScooterRepositoryImpl } from '../../data/repositories/ScooterRepositoryImpl'
import { CityRepositoryImpl } from '../../data/repositories/CityRepositoryImpl'

const scooterRepo = new ScooterRepositoryImpl()
const cityRepo = new CityRepositoryImpl()

interface ScooterState {
  scooters: Scooter[]
  cities: City[]
  selectedCity: City | null
  selectedScooter: Scooter | null
  isLoading: boolean
  isUnlocking: boolean
  unlockError: string | null

  loadCities: () => Promise<void>
  setSelectedCity: (city: City) => void
  loadScooters: (params: { lat?: number; lng?: number }) => Promise<void>
  selectScooter: (scooter: Scooter | null) => void
  unlock: (scooterId: number, code: string) => Promise<void>
  lock: (scooterId: number) => Promise<void>
  clearUnlockError: () => void
  // Aplica un update en vivo de un scooter existente (WebSocket location_update).
  // No agrega scooters nuevos — el mapa solo muestra los ya cargados por loadScooters.
  updateScooterFromSocket: (patch: { id: number; latitude?: number; longitude?: number; batteryLevel?: number; status?: string; lockState?: string }) => void
}

const UNLOCK_ERROR_MESSAGES: Record<string, string> = {
  invalid_unlock_code: 'Código incorrecto',
  scooter_unreachable: 'No pudimos contactar el scooter, intenta de nuevo',
  scooter_already_in_use: 'Este scooter ya está en uso',
  scooter_hardware_offline: 'Scooter sin señal, elige otro',
}

export const useScooterStore = create<ScooterState>((set, get) => ({
  scooters: [],
  cities: [],
  selectedCity: null,
  selectedScooter: null,
  isLoading: false,
  isUnlocking: false,
  unlockError: null,

  loadCities: async () => {
    const cities = await cityRepo.getCities()
    set({ cities })
    if (!get().selectedCity && cities.length > 0) {
      set({ selectedCity: cities[0] })
    }
  },

  setSelectedCity: (city) => set({ selectedCity: city }),

  loadScooters: async ({ lat, lng }) => {
    set({ isLoading: true })
    try {
      const city = get().selectedCity
      const scooters = await scooterRepo.getScooters({
        cityId: city?.id,
        lat,
        lng,
        radiusKm: city?.radiusKm,
      })
      set({ scooters })
    } finally {
      set({ isLoading: false })
    }
  },

  selectScooter: (scooter) => set({ selectedScooter: scooter, unlockError: null }),

  unlock: async (scooterId, code) => {
    set({ isUnlocking: true, unlockError: null })
    try {
      await scooterRepo.unlock(scooterId, code)
    } catch (e: any) {
      const errorCode = e?.response?.data?.error ?? 'scooter_unreachable'
      set({ unlockError: UNLOCK_ERROR_MESSAGES[errorCode] ?? 'Error al desbloquear' })
      throw e
    } finally {
      set({ isUnlocking: false })
    }
  },

  lock: async (scooterId) => {
    await scooterRepo.lock(scooterId)
  },

  clearUnlockError: () => set({ unlockError: null }),

  updateScooterFromSocket: (patch) => {
    const { scooters } = get()
    const idx = scooters.findIndex(s => s.id === patch.id)
    if (idx === -1) return
    const current = scooters[idx]
    const next: Scooter = {
      ...current,
      latitude: patch.latitude ?? current.latitude,
      longitude: patch.longitude ?? current.longitude,
      batteryLevel: patch.batteryLevel ?? current.batteryLevel,
      status: (patch.status as Scooter['status']) ?? current.status,
      lockState: (patch.lockState as Scooter['lockState']) ?? current.lockState,
    }
    // Solo emitir un nuevo array si cambio algo relevante (evita re-renders innecesarios).
    if (
      next.latitude === current.latitude &&
      next.longitude === current.longitude &&
      next.batteryLevel === current.batteryLevel &&
      next.status === current.status &&
      next.lockState === current.lockState
    ) return
    const nextList = scooters.slice()
    nextList[idx] = next
    set({ scooters: nextList })
  },
}))
