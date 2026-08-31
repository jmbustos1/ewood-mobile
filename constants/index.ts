export * from './colors'
export * from './theme'
export * from './mapStyle'

export const Config = {
  API_URL: process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8200',
  WS_URL: process.env.EXPO_PUBLIC_WS_URL ?? 'ws://10.0.2.2:8200',
  // GOOGLE_MAPS_API_KEY removida (2026-08-30): la app usa MapLibre
  // (OpenStreetMap tiles) — no requiere API key. La constante era
  // residual del scaffold inicial.
  MAP_DEFAULT_ZOOM: 15,
  SCOOTER_UNLOCK_RADIUS_METERS: 100,
  TRIP_POLL_INTERVAL_MS: 5000,
}
