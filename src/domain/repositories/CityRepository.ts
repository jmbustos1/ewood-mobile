import type { City } from '../entities'

export interface CityRepository {
  getCities(): Promise<City[]>
}
