export type TripStatus = 'active' | 'completed' | 'cancelled'

export interface Trip {
  id: number
  scooterId: number
  scooterCode?: string
  userId: number
  status: TripStatus
  startLatitude: number
  startLongitude: number
  endLatitude?: number
  endLongitude?: number
  startedAt: string
  endedAt?: string
  durationSeconds?: number
  distanceMeters?: number
  averageSpeedKmh?: number
  maxSpeedKmh?: number
  costAmount?: number
}

export interface TripSummary {
  trip: Trip
  durationFormatted: string   // "12:34"
  distanceFormatted: string   // "2.4 km"
  minutesCharged?: number     // minutos cobrados (ceil de la duración)
  pricePerMinute?: number     // tarifa neta aplicada al viaje
  subtotal?: number           // monto neto (sin IVA)
  taxAmount?: number          // IVA aplicado
  taxRate?: number            // tasa de IVA (0.19 = 19%)
  total?: number              // total cobrado con IVA
}
