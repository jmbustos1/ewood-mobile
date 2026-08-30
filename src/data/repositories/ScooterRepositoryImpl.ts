import type { ScooterRepository, GetScootersParams } from '../../domain/repositories'
import type { Scooter } from '../../domain/entities'
import { apiClient } from '../api/apiClient'

export class ScooterRepositoryImpl implements ScooterRepository {
  async getScooters(params: GetScootersParams): Promise<Scooter[]> {
    const { data } = await apiClient.get('/api/scooters', { params: {
      city_id: params.cityId,
      lat: params.lat,
      lng: params.lng,
      radius_km: params.radiusKm,
    }})
    const list = Array.isArray(data) ? data : (data?.scooters ?? [])
    return list.map(this.mapScooter)
  }

  async getScooterById(id: number): Promise<Scooter> {
    const { data } = await apiClient.get(`/api/scooters/${id}`)
    return this.mapScooter(data)
  }

  async unlock(scooterId: number, code: string): Promise<void> {
    await apiClient.post(`/api/scooters/${scooterId}/unlock`, { code })
  }

  async lock(scooterId: number): Promise<void> {
    await apiClient.post(`/api/scooters/${scooterId}/lock`)
  }

  private mapScooter(raw: any): Scooter {
    return {
      id: raw.id,
      code: raw.code,
      model: raw.model,
      status: raw.status,
      batteryLevel: raw.battery_level,
      latitude: raw.last_latitude,
      longitude: raw.last_longitude,
      distanceMeters: raw.distance_meters,
      cityId: raw.city_id,
      lastLocationUpdatedAt: raw.last_location_updated_at,
      lockState: raw.lock_state,
    }
  }
}
