import type { Scooter } from '../entities'

export interface GetScootersParams {
  cityId?: number
  lat?: number
  lng?: number
  radiusKm?: number
}

export type UnlockError =
  | 'invalid_unlock_code'
  | 'scooter_unreachable'
  | 'scooter_already_in_use'
  | 'scooter_hardware_offline'

export interface ScooterRepository {
  getScooters(params: GetScootersParams): Promise<Scooter[]>
  getScooterById(id: number): Promise<Scooter>
  unlock(scooterId: number, code: string): Promise<void>
  lock(scooterId: number): Promise<void>
}
