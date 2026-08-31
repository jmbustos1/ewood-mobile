import type { Trip, TripSummary } from '../entities'

export interface EndTripParams {
  tripId: number
  lat: number
  lng: number
}

export interface TripRepository {
  startTrip(scooterId: number): Promise<Trip>
  endTrip(params: EndTripParams): Promise<TripSummary>
  getActiveTrip(): Promise<Trip | null>
  getTripHistory(): Promise<Trip[]>
  getTripById(id: number): Promise<Trip>
}
