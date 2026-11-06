import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useTripStore } from '../../src/presentation/stores/tripStore'
import { useAuthStore } from '../../src/presentation/stores/authStore'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants'

const LOGO = require('../../assets/logo-exwood.png')

function formatDateTime(iso?: string) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

function formatDuration(seconds?: number) {
  if (!seconds) return '-'
  const m = Math.floor(seconds / 60)
  return `${m} min`
}

export default function SummaryScreen() {
  const router = useRouter()
  const { lastSummary } = useTripStore()
  const { user } = useAuthStore()
  const trip = lastSummary?.trip
  const initial = user?.name?.[0]?.toUpperCase() ?? '?'

  const subtotal = lastSummary?.subtotal ?? 0
  const iva = lastSummary?.taxAmount ?? 0
  const total = lastSummary?.total ?? trip?.costAmount ?? 0
  const ivaPct = Math.round((lastSummary?.taxRate ?? 0.19) * 100)
  const minutesCharged = lastSummary?.minutesCharged
  const pricePerMinute = lastSummary?.pricePerMinute
  const hasBreakdown = total > 0 && minutesCharged != null && pricePerMinute != null
  const pendingPayment = total > 0 && !trip?.costAmount

  function handlePay() {
    // TODO: integrar con flow de pago de MercadoPago — generar preference para este trip.
    // Por ahora simulamos exito y vamos a payment-result.
    Alert.alert(
      'Procesando pago',
      'El pago por viaje aún no está conectado a MercadoPago. Vamos a simular un pago exitoso.',
      [{ text: 'OK', onPress: () => router.push({ pathname: '/(app)/payment-result', params: { status: 'success' } }) }]
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Volver</Text>
        </TouchableOpacity>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity style={styles.avatar} onPress={() => router.push('/(app)/profile')}>
          <Text style={styles.avatarText}>{initial}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Detalle del Viaje</Text>

        <View style={[styles.routeBox, Shadow.card]}>
          <View style={styles.routeIllustration}>
            <View style={styles.routeStart} />
            <View style={styles.routeLine} />
            <View style={styles.routeEnd} />
          </View>
        </View>

        <View style={styles.section}>
          <Row label="Modelo" value="WoodRide - Pro 2.0" />
          <Row label="Código Scooter" value={trip?.scooterCode ?? '-'} />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Row label="Inicio Viaje" value={formatDateTime(trip?.startedAt)} />
          <Row label="Término Viaje" value={formatDateTime(trip?.endedAt)} />
          <Row label="Duración" value={lastSummary?.durationFormatted ?? formatDuration(trip?.durationSeconds)} />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Row label="Arrendado" value={total > 0 ? 'Sí' : 'No'} />
          {hasBreakdown && (
            <>
              <Row
                label="Tiempo cobrado"
                value={`${minutesCharged} min × $${Math.round(pricePerMinute!).toLocaleString('es-CL')}`}
              />
              <Row label="Subtotal (neto)" value={`$${Math.round(subtotal).toLocaleString('es-CL')}`} />
            </>
          )}
          <Row
            label={`IVA(${ivaPct}%)`}
            value={total > 0 ? `$${Math.round(iva).toLocaleString('es-CL')}` : '-'}
          />
          <Row
            label="Costo Total"
            value={total > 0 ? `$${Math.round(total).toLocaleString('es-CL')}` : '-'}
            bold
          />
        </View>

        <View style={styles.divider} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btn, total > 0 ? styles.btnPay : styles.btnBack]}
          onPress={total > 0 && pendingPayment ? handlePay : () => router.replace('/(app)/map')}
        >
          <Text style={[styles.btnText, total > 0 && pendingPayment ? styles.btnPayText : styles.btnBackText]}>
            {total > 0 && pendingPayment ? 'Pagar Ahora' : 'Volver al Mapa'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, bold && styles.labelBold]}>{label}</Text>
      <Text style={[styles.value, bold && styles.valueBold]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.md,
  },
  backRow: { width: 80 },
  backText: { fontSize: Typography.size.sm, color: Colors.white[60] },
  logo: { width: 90, height: 24 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.green[900],
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: Typography.weight.bold, color: Colors.green[500] },

  scroll: { padding: Spacing.lg, paddingBottom: 120, gap: Spacing.lg },
  title: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.bold, color: Colors.white[100] },

  routeBox: {
    height: 180,
    backgroundColor: '#E5E7EB',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeIllustration: {
    width: '80%', height: 4,
    flexDirection: 'row', alignItems: 'center',
  },
  routeStart: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.green[500] },
  routeLine: { flex: 1, height: 3, backgroundColor: Colors.green[500] },
  routeEnd: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.green[500] },

  section: { gap: Spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: Typography.size.sm, color: Colors.white[60] },
  labelBold: { fontWeight: Typography.weight.bold, color: Colors.white[100] },
  value: { fontSize: Typography.size.sm, color: Colors.white[100], fontWeight: Typography.weight.medium },
  valueBold: { fontWeight: Typography.weight.bold },
  divider: { height: 1, backgroundColor: Colors.white[10] },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: Spacing.lg, paddingBottom: 48,
    backgroundColor: Colors.bg.primary,
  },
  btn: { borderRadius: Radius.pill, paddingVertical: 18, alignItems: 'center' },
  btnPay: { backgroundColor: Colors.green[500] },
  btnBack: { backgroundColor: Colors.bg.elevated },
  btnText: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold },
  btnPayText: { color: Colors.bg.primary },
  btnBackText: { color: Colors.white[100] },
})
