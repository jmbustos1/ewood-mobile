import { create } from 'zustand'
import type { Trip, TripSummary } from '../../domain/entities'
import { TripRepositoryImpl } from '../../data/repositories/TripRepositoryImpl'
import type { EndTripParams } from '../../domain/repositories'

const repo = new TripRepositoryImpl()

interface TripState {
  activeTrip: Trip | null
  // Timestamp local (ms) capturado cuando esta sesión INICIÓ el trip.
  // Evita desfases con el reloj del servidor. Null si el trip viene de checkActiveTrip
  // (la sesión no inició el viaje, sólo lo encontró activo al volver).
  activeTripLocalStartMs: number | null
  lastSummary: TripSummary | null
  history: Trip[]
  isLoading: boolean
  error: string | null

  checkActiveTrip: () => Promise<Trip | null>
  startTrip: (scooterId: number) => Promise<Trip>
  endTrip: (params: EndTripParams) => Promise<TripSummary>
  loadHistory: () => Promise<void>
  clearError: () => void
}

export const useTripStore = create<TripState>((set, get) => ({
  activeTrip: null,
  activeTripLocalStartMs: null,
  lastSummary: null,
  history: [],
  isLoading: false,
  error: null,

  checkActiveTrip: async () => {
    const trip = await repo.getActiveTrip()
    set({ activeTrip: trip })
    // Si encontró un trip activo de otra sesión, no tenemos ancla local: el
    // componente caerá al startedAt del backend.
    return trip
  },

  startTrip: async (scooterId) => {
    set({ isLoading: true, error: null })
    try {
      const trip = await repo.startTrip(scooterId)
      // Ancla LOCAL al instante en que respondió el backend con éxito.
      // El timer del componente usa esto en vez del startedAt del server.
      set({ activeTrip: trip, activeTripLocalStartMs: Date.now() })
      return trip
    } catch (e: any) {
      set({ error: e?.response?.data?.message ?? 'Error al iniciar el viaje' })
      throw e
    } finally {
      set({ isLoading: false })
    }
  },

  endTrip: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const summary = await repo.endTrip(params)
      // Agregar al history en memoria para evitar fetch al volver a /history
      const currentHistory = get().history
      const exists = currentHistory.some(t => t.id === summary.trip.id)
      const newHistory = exists ? currentHistory : [summary.trip, ...currentHistory]
      set({ activeTrip: null, activeTripLocalStartMs: null, lastSummary: summary, history: newHistory })
      return summary
    } catch (e: any) {
      set({ error: e?.response?.data?.message ?? 'Error al terminar el viaje' })
      throw e
    } finally {
      set({ isLoading: false })
    }
  },

  loadHistory: async () => {
    set({ isLoading: true })
    try {
      const history = await repo.getTripHistory()
      set({ history })
    } catch (e: any) {
      set({ error: e?.response?.data?.message ?? 'Error al cargar historial' })
    } finally {
      set({ isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
