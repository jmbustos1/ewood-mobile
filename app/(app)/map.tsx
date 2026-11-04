import { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Pressable } from 'react-native'
import MapLibreGL from '@maplibre/maplibre-react-native'
import * as Location from 'expo-location'
import { useRouter, useFocusEffect } from 'expo-router'
import { useScooterStore } from '../../src/presentation/stores/scooterStore'
import { useTripStore } from '../../src/presentation/stores/tripStore'
import { useWalletStore } from '../../src/presentation/stores/walletStore'
import { useAuthStore } from '../../src/presentation/stores/authStore'
import { useConfigStore } from '../../src/presentation/stores/configStore'
import { useScooterSocket, type ScooterUpdate } from '../../src/data/realtime/useScooterSocket'
import { Input } from '../../src/presentation/components/Input'
import { Button } from '../../src/presentation/components/Button'
import { BatteryBadge } from '../../src/presentation/components/BatteryBadge'
import { Icon } from '../../src/presentation/components/Icon'
import { Colors, Typography, Spacing, Radius, Shadow, OSM_MAP_STYLE } from '../../constants'
import type { Scooter, LockState } from '../../src/domain/entities'

const LOGO = require('../../assets/logo-exwood.png')
const MIN_BALANCE_FOR_BANNER = 1000

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function MapScreen() {
  const router = useRouter()
  const cameraRef = useRef<MapLibreGL.Camera>(null)
  const { scooters, selectedScooter, selectedCity, loadCities, loadScooters, selectScooter, isUnlocking, unlockError, clearUnlockError, updateScooterFromSocket } = useScooterStore()
  const {
    startTrip, checkActiveTrip,
    activeTrip, activeTripLocalStartMs,
    endTrip, isLoading: isEndingTrip,
  } = useTripStore()
  const { balance, loadWallet } = useWalletStore()
  const { user } = useAuthStore()
  const pricePerMinute = useConfigStore(s => s.config.pricing.pricePerMinuteClp)

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locationDenied, setLocationDenied] = useState(false)

  const [unlockCode, setUnlockCode] = useState('')
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [tripError, setTripError] = useState<string | null>(null)

  const [elapsed, setElapsed] = useState(0)
  const [scooterLocation, setScooterLocation] = useState<[number, number] | null>(null)
  const [scooterBattery, setScooterBattery] = useState<number | null>(null)
  const [scooterLock, setScooterLock] = useState<LockState | null>(null)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const locationSub = useRef<Location.LocationSubscription | null>(null)

  const initial = user?.name?.[0]?.toUpperCase() ?? '?'
  const totalPrice = Math.round((elapsed / 60) * pricePerMinute)
  const showLowBalanceBanner = !activeTrip && balance < MIN_BALANCE_FOR_BANNER

  useEffect(() => {
    MapLibreGL.setAccessToken(null)
    loadCities()
    loadWallet().catch(() => {})
    requestLocation()
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (activeTrip) return
      checkActiveTrip().catch(() => {})
      // Refrescar lista de scooters al volver a foco. Cubre el caso Android
      // donde back/home no desmonta el componente, entonces el useEffect
      // inicial no se re-ejecuta y la lista queda cacheada.
      loadScooters({}).catch(() => {})
    }, [activeTrip])
  )

  // Único handler del WebSocket:
  //   - Con trip activo: actualiza posición y batería del scooter en trip.
  //     NO mueve la cámara en cada update — la vista salta cada 6s y bloquea
  //     al usuario que quiera hacer scroll. La cámara se centra solo una vez
  //     al arrancar el trip (efecto separado abajo).
  //   - Sin trip: aplica location_updates a la lista general del store para
  //     que los pines se muevan en vivo.
  const activeTripScooterId = activeTrip?.scooterId
  const handleSocketMessage = useCallback((msg: ScooterUpdate) => {
    if (msg.type !== 'location_update') return
    const lat = msg.data?.latitude ?? msg.latitude
    const lng = msg.data?.longitude ?? msg.longitude
    if (lat == null || lng == null) return
    if (lat === 0 && lng === 0) return

    if (activeTripScooterId != null) {
      if (msg.scooter_id !== activeTripScooterId) return
      setScooterLocation([lng, lat])
      if (msg.data?.battery_level != null) setScooterBattery(msg.data.battery_level)
      if (msg.data?.lock_state) setScooterLock(msg.data.lock_state as LockState)
      return
    }

    updateScooterFromSocket({
      id: msg.scooter_id,
      latitude: lat,
      longitude: lng,
      batteryLevel: msg.data?.battery_level,
      status: msg.data?.status,
      lockState: msg.data?.lock_state,
    })
  }, [activeTripScooterId, updateScooterFromSocket])

  useScooterSocket({ onMessage: handleSocketMessage })

  // Centrar cámara UNA sola vez al iniciar un trip. Usa startLatitude/Longitude
  // del trip (disponibles inmediatamente) en vez de esperar al primer WS.
  // Depende solo del trip.id → no se dispara en cada update de posición.
  useEffect(() => {
    if (!activeTrip) return
    cameraRef.current?.setCamera({
      centerCoordinate: [activeTrip.startLongitude, activeTrip.startLatitude],
      zoomLevel: 16,
      animationDuration: 500,
    })
  }, [activeTrip?.id])

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (!activeTrip) { setElapsed(0); return }
    let startMs: number | null = null
    if (activeTripLocalStartMs != null) startMs = activeTripLocalStartMs
    else if (activeTrip.startedAt) {
      const parsed = new Date(activeTrip.startedAt).getTime()
      if (!isNaN(parsed)) startMs = parsed
    }
    if (startMs == null) return
    const anchor = startMs
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - anchor) / 1000)))
    tick()
    intervalRef.current = setInterval(tick, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [activeTrip?.id, activeTripLocalStartMs])

  useEffect(() => {
    if (!activeTrip) {
      locationSub.current?.remove()
      return
    }
    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
      (loc) => setUserLocation([loc.coords.longitude, loc.coords.latitude])
    ).then(sub => { locationSub.current = sub })
    return () => { locationSub.current?.remove() }
  }, [activeTrip?.id])

  async function requestLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') { setLocationDenied(true); return }
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      const lngLat: [number, number] = [loc.coords.longitude, loc.coords.latitude]
      setUserLocation(lngLat)
      loadScooters({ lat: loc.coords.latitude, lng: loc.coords.longitude })
    } catch {
      loadScooters({})
    }
  }

  async function handleUnlock() {
    if (!selectedScooter || !unlockCode.trim()) return
    setTripError(null)
    try {
      await startTrip(selectedScooter.id)
      setShowUnlockModal(false)
      setUnlockCode('')
      selectScooter(null)
    } catch (e: any) {
      const errCode = e?.response?.data?.error
      if (errCode === 'negative_balance') {
        setShowUnlockModal(false)
        setUnlockCode('')
        selectScooter(null)
        router.push({ pathname: '/(app)/wallet', params: { negativeBalance: '1' } })
        return
      }
      setTripError(errCode ?? 'Error al iniciar arriendo')
    }
  }

  async function handleEndTrip() {
    if (!activeTrip) return
    let lat = activeTrip.startLatitude
    let lng = activeTrip.startLongitude
    if (scooterLocation) { lng = scooterLocation[0]; lat = scooterLocation[1] }
    else if (userLocation) { lng = userLocation[0]; lat = userLocation[1] }
    await endTrip({ tripId: activeTrip.id, lat, lng })
    setShowEndConfirm(false)
    router.push('/(app)/summary')
  }

  function handleMarkerPress(scooter: Scooter) {
    if (activeTrip) return
    if (scooter.status !== 'available') return
    selectScooter(scooter)
    if (scooter.longitude != null && scooter.latitude != null) {
      cameraRef.current?.setCamera({
        centerCoordinate: [scooter.longitude, scooter.latitude],
        zoomLevel: 16,
        animationDuration: 500,
      })
    }
  }

  if (locationDenied) return (
    <View style={styles.permissionScreen}>
      <Text style={styles.permissionIcon}>📍</Text>
      <Text style={styles.permissionTitle}>Necesitamos tu ubicación</Text>
      <Text style={styles.permissionBody}>Para mostrarte los scooters cercanos necesitamos acceder a tu ubicación.</Text>
      <Button label="Permitir ubicación" onPress={requestLocation} />
    </View>
  )

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        style={StyleSheet.absoluteFill}
        mapStyle={OSM_MAP_STYLE}
        onPress={() => !activeTrip && selectScooter(null)}
        logoEnabled={false}
        attributionEnabled
        attributionPosition={{ bottom: 8, right: 8 }}
      >
        <MapLibreGL.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: [-73.0502, -36.8267],
            zoomLevel: 13,
          }}
        />

        {activeTrip && scooterLocation && (
          <MapLibreGL.PointAnnotation id="active-scooter" coordinate={scooterLocation}>
            <View style={styles.markerContainer}>
              <Icon name="scooter-map" size={50} />
            </View>
          </MapLibreGL.PointAnnotation>
        )}

        {/* Solo mostramos scooters disponibles con GPS válido. Coords (0,0)
           significan que el firmware aún no logró fix — no queremos pintar
           un pin en el ecuador. El backend ya filtra por status=available. */}
        {!activeTrip && scooters
          .filter(s =>
            s.status === 'available' &&
            s.latitude != null && s.longitude != null &&
            !(s.latitude === 0 && s.longitude === 0)
          )
          .map((s) => (
            <MapLibreGL.MarkerView
              key={`scooter-${s.id}`}
              id={`scooter-${s.id}`}
              coordinate={[s.longitude!, s.latitude!]}
            >
              <Pressable onPress={() => handleMarkerPress(s)} style={styles.markerContainer}>
                <Icon name="scooter-map" size={44} />
                <View style={styles.batteryPill}>
                  <Text style={styles.batteryText}>{s.batteryLevel}%</Text>
                </View>
              </Pressable>
            </MapLibreGL.MarkerView>
          ))}

        {userLocation && (
          <MapLibreGL.PointAnnotation id="user" coordinate={userLocation}>
            <View style={styles.userMarker} />
          </MapLibreGL.PointAnnotation>
        )}
      </MapLibreGL.MapView>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity style={styles.avatar} onPress={() => router.push('/(app)/profile')}>
          <Text style={styles.avatarText}>{initial}</Text>
        </TouchableOpacity>
      </View>

      {showLowBalanceBanner && (
        <TouchableOpacity style={styles.banner} onPress={() => router.push('/(app)/wallet/recharge')}>
          <View style={styles.bannerIcon}>
            <Text style={styles.bannerIconText}>!</Text>
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Parece que te falta saldo</Text>
            <Text style={styles.bannerBody}>Agrega más saldo para empezar a moverte.</Text>
          </View>
        </TouchableOpacity>
      )}

      {!activeTrip && !showLowBalanceBanner && (
        <View style={styles.cityPill}>
          <Text style={styles.cityText}>📍 {selectedCity?.name ?? 'Seleccionar ciudad'}</Text>
        </View>
      )}

      {!activeTrip && selectedScooter && (
        <View style={[styles.sheet, Shadow.sheet]}>
          <View style={styles.dragHandle} />
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>● Disponible</Text>
          </View>
          <View style={styles.scooterRow}>
            <Icon name="scooter-line" size={40} color={Colors.white[100]} />
            <View style={styles.scooterInfo}>
              <Text style={styles.scooterName}>{selectedScooter.code}</Text>
              <Text style={styles.scooterAddress}>Scooter disponible</Text>
              <View style={styles.scooterPills}>
                {selectedScooter.distanceMeters != null && (
                  <View style={styles.pill}>
                    <Icon name="map-tag" size={14} color={Colors.white[60]} />
                    <Text style={styles.pillText}>
                      {selectedScooter.distanceMeters < 1000
                        ? `${Math.round(selectedScooter.distanceMeters)}m`
                        : `${(selectedScooter.distanceMeters / 1000).toFixed(1)}km`}
                    </Text>
                  </View>
                )}
                <BatteryBadge level={selectedScooter.batteryLevel} />
              </View>
            </View>
          </View>
          <View style={styles.sheetButtons}>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => selectScooter(null)}>
              <Text style={styles.btnSecondaryText}>Cerrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => setShowUnlockModal(true)}>
              <Text style={styles.btnPrimaryText}>Desbloquear</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.tariff}>Tarifa: ${pricePerMinute}/min</Text>
        </View>
      )}

      {activeTrip && (
        <View style={[styles.sheet, Shadow.sheet]}>
          <View style={styles.dragHandle} />
          <View style={styles.tripHeader}>
            <View style={styles.tripBadge}>
              <View style={styles.tripDot} />
              <Text style={styles.tripBadgeText}>En Uso</Text>
            </View>
            <Text style={styles.tripTimer}>{formatDuration(elapsed)}</Text>
          </View>
          <View style={styles.scooterRow}>
            <Icon name="scooter-line" size={40} color={Colors.white[100]} />
            <View style={styles.scooterInfo}>
              <Text style={styles.scooterName}>{activeTrip.scooterCode ?? `Scooter #${activeTrip.scooterId}`}</Text>
              <Text style={styles.scooterAddress}>
                Total hasta ahora: <Text style={styles.totalAmount}>${totalPrice.toLocaleString('es-CL')}</Text>
              </Text>
              <View style={styles.scooterPills}>
                <View style={styles.pill}>
                  <Icon name="map-tag" size={14} color={Colors.white[60]} />
                  <Text style={styles.pillText}>{scooterLocation ? 'En vivo' : 'Esperando GPS'}</Text>
                </View>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>🔋 {scooterBattery != null ? `${scooterBattery}%` : '--'}</Text>
                </View>
                {scooterLock && (
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>
                      {scooterLock === 'locked' ? '🔒 Cerrado' :
                       scooterLock === 'unlocked' ? '🔓 Abierto' : '❓ ---'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.btnEnd} onPress={() => setShowEndConfirm(true)}>
            <Text style={styles.btnEndText}>Finalizar Viaje</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={showUnlockModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, Shadow.card]}>
            <Text style={styles.modalTitle}>Ingresa el código del scooter</Text>
            <Text style={styles.modalBody}>Encuéntralo en el manubrio.</Text>
            <Input
              value={unlockCode}
              onChangeText={(t) => { setUnlockCode(t); setTripError(null); clearUnlockError() }}
              placeholder="EWOOD-XXXX"
              autoCapitalize="characters"
              error={unlockError ?? undefined}
            />
            {tripError && <Text style={styles.errorText}>{tripError}</Text>}
            <Button label="Confirmar" onPress={handleUnlock} loading={isUnlocking} />
            <Button label="Cancelar" variant="ghost" onPress={() => { setShowUnlockModal(false); setUnlockCode(''); setTripError(null); clearUnlockError() }} />
          </View>
        </View>
      </Modal>

      <Modal visible={showEndConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, Shadow.card]}>
            <Text style={styles.modalTitle}>¿Terminar viaje?</Text>
            <Text style={styles.modalBody}>
              Se finalizará tu recorrido y se calculará el total a pagar. Asegúrate de{' '}
              <Text style={styles.modalHighlight}>estacionar correctamente</Text> antes de finalizar.
            </Text>
            <TouchableOpacity style={styles.btnPrimaryFull} onPress={handleEndTrip} disabled={isEndingTrip}>
              <Text style={styles.btnPrimaryText}>
                {isEndingTrip ? 'Finalizando...' : 'Finalizar Viaje'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondaryFull} onPress={() => setShowEndConfirm(false)}>
              <Text style={styles.btnSecondaryText}>Continuar Viaje</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },

  permissionScreen: { flex: 1, backgroundColor: Colors.bg.primary, padding: Spacing.lg, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg },
  permissionIcon: { fontSize: 64 },
  permissionTitle: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: Colors.white[100], textAlign: 'center' },
  permissionBody: { fontSize: Typography.size.sm, color: Colors.white[60], textAlign: 'center', lineHeight: 22 },

  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.md,
    backgroundColor: 'rgba(8,13,9,0.55)',
  },
  headerSide: { width: 36 },
  logo: { width: 110, height: 28 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.green[900],
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.white[100],
  },
  avatarText: { fontSize: 16, fontWeight: Typography.weight.bold, color: Colors.green[500] },

  banner: {
    position: 'absolute', top: 120, left: Spacing.md, right: Spacing.md,
    backgroundColor: 'rgba(40,40,40,0.92)',
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
  },
  bannerIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.white[30],
    alignItems: 'center', justifyContent: 'center',
  },
  bannerIconText: { fontSize: 18, fontWeight: Typography.weight.bold, color: Colors.white[100] },
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: Typography.size.sm, fontWeight: Typography.weight.bold, color: Colors.white[100] },
  bannerBody: { fontSize: Typography.size.xs, color: Colors.white[60], marginTop: 2 },

  userMarker: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.green[500], borderWidth: 2, borderColor: Colors.white[100] },
  // Pin tocable acotado 44x44 (touch target estándar). Evita que hitboxes de
  // pines cercanos se solapen y que se dispare selección al tocar el mapa cerca.
  markerContainer: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  batteryPill: {
    position: 'absolute', top: -2, right: -6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 5, paddingVertical: 1,
    borderRadius: 8,
  },
  batteryText: { fontSize: 10, fontWeight: '700', color: '#fff' },

  cityPill: {
    position: 'absolute', top: 120, alignSelf: 'center',
    backgroundColor: Colors.bg.overlay,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.pill, borderWidth: 1, borderColor: Colors.white[10],
  },
  cityText: { color: Colors.white[100], fontSize: Typography.size.sm, fontWeight: Typography.weight.medium },

  sheet: {
    position: 'absolute', bottom: 100, left: 0, right: 0,
    backgroundColor: Colors.bg.surface,
    borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg,
    padding: Spacing.lg, gap: Spacing.md,
  },
  dragHandle: { width: 40, height: 4, backgroundColor: Colors.white[30], borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.xs },

  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.green[900],
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  statusBadgeText: { fontSize: Typography.size.xs, fontWeight: Typography.weight.bold, color: Colors.green[400] },

  scooterRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  scooterInfo: { flex: 1, gap: 4 },
  scooterName: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.white[100] },
  scooterAddress: { fontSize: Typography.size.sm, color: Colors.white[60] },
  scooterPills: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.bg.elevated,
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  pillText: { fontSize: Typography.size.xs, color: Colors.white[60] },

  sheetButtons: { flexDirection: 'row', gap: Spacing.md },
  btnSecondary: {
    flex: 1,
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnSecondaryFull: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnSecondaryText: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.white[100] },
  btnPrimary: {
    flex: 1,
    backgroundColor: Colors.green[500],
    borderRadius: Radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnPrimaryFull: {
    backgroundColor: Colors.green[500],
    borderRadius: Radius.pill,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnPrimaryText: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.bg.primary },
  tariff: { fontSize: Typography.size.xs, color: Colors.white[60], textAlign: 'center' },

  tripHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  tripBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tripDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.green[500] },
  tripBadgeText: { fontSize: Typography.size.sm, fontWeight: Typography.weight.bold, color: Colors.green[400] },
  tripTimer: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.green[400] },
  totalAmount: { color: Colors.white[100], fontWeight: Typography.weight.bold },
  btnEnd: {
    backgroundColor: Colors.green[500],
    borderRadius: Radius.pill,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnEndText: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.bg.primary },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: Spacing.lg },
  modalCard: { backgroundColor: Colors.bg.surface, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.md },
  modalTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.white[100] },
  modalBody: { fontSize: Typography.size.sm, color: Colors.white[60], lineHeight: 22 },
  modalHighlight: { color: Colors.green[400], fontWeight: Typography.weight.bold },
  errorText: { fontSize: Typography.size.sm, color: Colors.red[500], textAlign: 'center' },
})
