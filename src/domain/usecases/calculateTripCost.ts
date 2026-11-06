import type { Pricing } from '../entities'

export interface TripCostBreakdown {
  minutesCharged: number
  subtotal: number
  taxAmount: number
  total: number
}

// Replica exacta de calculateTripCost en backend-ewood/internal/handler/trip.go:
// cobra por minuto iniciado (ceil), IVA sobre el subtotal, pesos enteros.
export function calculateTripCost(durationSeconds: number, pricing: Pricing): TripCostBreakdown {
  if (durationSeconds <= 0) {
    return { minutesCharged: 0, subtotal: 0, taxAmount: 0, total: 0 }
  }
  const minutesCharged = Math.ceil(durationSeconds / 60)
  const subtotal = Math.round(minutesCharged * pricing.pricePerMinuteClp)
  const taxAmount = Math.round(subtotal * pricing.taxRate)
  return { minutesCharged, subtotal, taxAmount, total: subtotal + taxAmount }
}
