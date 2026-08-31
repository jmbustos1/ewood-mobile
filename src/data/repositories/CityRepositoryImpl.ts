import type { CityRepository } from '../../domain/repositories'
import type { City } from '../../domain/entities'
import { apiClient } from '../api/apiClient'

export class CityRepositoryImpl implements CityRepository {
  async getCities(): Promise<City[]> {
    const { data } = await apiClient.get('/api/cities')
    return data.map((raw: any): City => ({
      id: raw.id,
      name: raw.name,
      country: raw.country,
      lat: raw.lat,
      lng: raw.lng,
      radiusKm: raw.radius_km,
    }))
  }
}
