export type ScooterStatus = 'available' | 'in_use' | 'maintenance' | 'offline'

// Estado físico del actuador reportado por el firmware (frame SYS STATUS del
// hub de sensores, byte Locker). Fuente de verdad para saber si el candado
// realmente cerró después de un end-trip.
export type LockState = 'locked' | 'unlocked' | 'unknown'

export interface Scooter {
  id: number
  code: string
  model?: string
  status: ScooterStatus
  batteryLevel: number
  latitude?: number
  longitude?: number
  distanceMeters?: number   // calculado por el backend según ubicación del usuario
  cityId?: number
  lastLocationUpdatedAt?: string
  lockState?: LockState
}
