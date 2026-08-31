import type { TripRepository, EndTripParams } from '../../domain/repositories'
import type { Trip, TripSummary } from '../../domain/entities'
import { apiClient } from '../api/apiClient'

export class TripRepositoryImpl implements TripRepository {
  async startTrip(scooterId: number): Promise<Trip> {
    // Timeout largo: el backend espera ACK del hardware (hasta 25s)
    const { data } = await apiClient.post('/api/trips', { scooter_id: scooterId }, { timeout: 35000 })
    return this.mapTrip(data.trip ?? data)
  }

  async endTrip(params: EndTripParams): Promise<TripSummary> {
    // Timeout largo: el backend espera ACK del hardware (hasta 25s)
    const { data } = await apiClient.patch(`/api/trips/${params.tripId}/end`, {
      lat: params.lat,
      lng: params.lng,
    }, { timeout: 35000 })
    return {
      trip: this.mapTrip(data.trip),
      durationFormatted: data.duration_formatted,
      distanceFormatted: data.distance_formatted,
      subtotal: data.subtotal,
      taxAmount: data.tax_amount,
      taxRate: data.tax_rate,
      total: data.total ?? data.cost,
    }
  }

  async getActiveTrip(): Promise<Trip | null> {
    try {
      const { data } = await apiClient.get('/api/trips/active')
      return this.mapTrip(data)
    } catch (e: any) {
      if (e?.response?.status === 404) return null
      throw e
    }
  }

  async getTripHistory(): Promise<Trip[]> {
    const { data } = await apiClient.get('/api/trips')
    return data.map(this.mapTrip)
  }

  async getTripById(id: number): Promise<Trip> {
    const { data } = await apiClient.get(`/api/trips/${id}`)
    return this.mapTrip(data)
  }

  private mapTrip(raw: any): Trip {
    return {
      id: raw.id,
      scooterId: raw.scooter_id,
      scooterCode: raw.scooter_code ?? raw.scooter?.code,
      userId: raw.user_id,
      status: raw.status,
      startLatitude: raw.start_latitude,
      startLongitude: raw.start_longitude,
      endLatitude: raw.end_latitude,
      endLongitude: raw.end_longitude,
      startedAt: raw.started_at,
      endedAt: raw.ended_at,
      durationSeconds: raw.duration_seconds,
      distanceMeters: raw.distance_meters,
      averageSpeedKmh: raw.average_speed_kmh,
      maxSpeedKmh: raw.max_speed_kmh,
      costAmount: raw.cost_amount,
    }
  }
}
