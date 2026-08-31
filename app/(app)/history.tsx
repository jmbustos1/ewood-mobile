import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { useTripStore } from '../../src/presentation/stores/tripStore'
import { useAuthStore } from '../../src/presentation/stores/authStore'
import { Icon } from '../../src/presentation/components/Icon'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants'
import type { Trip } from '../../src/domain/entities'

const LOGO = require('../../assets/logo-exwood.png')

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' }) +
    '  ' + d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

function formatDuration(seconds?: number) {
  if (!seconds) return '-'
  const m = Math.floor(seconds / 60)
  return `${m} min`
}

function formatDistance(meters?: number) {
  if (!meters) return '0 km'
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`
}

function formatCost(cost?: number) {
  if (!cost) return '-'
  return '$' + Math.round(cost).toLocaleString('es-CL')
}

function TripCard({ trip, onPress }: { trip: Trip; onPress: () => void }) {
  return (
    <View style={[styles.card, Shadow.card]}>
      <View style={styles.cardMap}>
        <View style={styles.routeIllustration}>
          <View style={styles.routeStart} />
          <View style={styles.routeLine} />
          <View style={styles.routeEnd} />
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardDate}>{formatDate(trip.startedAt)}</Text>
        <View style={styles.cardPills}>
          <View style={styles.pill}>
            <Icon name="clock-tag" size={14} color={Colors.white[60]} />
            <Text style={styles.pillText}>{formatDuration(trip.durationSeconds)}</Text>
          </View>
          <View style={styles.pill}>
            <Icon name="map-tag" size={14} color={Colors.white[60]} />
            <Text style={styles.pillText}>{formatDistance(trip.distanceMeters)}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.cost}>{formatCost(trip.costAmount)}</Text>
          <TouchableOpacity style={styles.detailsBtn} onPress={onPress}>
            <Text style={styles.detailsText}>Ver Detalles</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default function HistoryScreen() {
  const router = useRouter()
  const { history, loadHistory, isLoading } = useTripStore()
  const { user } = useAuthStore()
  const [refreshing, setRefreshing] = useState(false)
  const initial = user?.name?.[0]?.toUpperCase() ?? '?'

  useEffect(() => { loadHistory() }, [])

  async function handleRefresh() {
    setRefreshing(true)
    await loadHistory()
    setRefreshing(false)
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

      <Text style={styles.title}>Historial de Viajes</Text>

      {history.length === 0 && !isLoading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛴</Text>
          <Text style={styles.emptyTitle}>Sin viajes aún</Text>
          <Text style={styles.emptyText}>Cuando hagas tu primer viaje, aparecerá acá.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={t => t.id.toString()}
          renderItem={({ item }) => (
            <TripCard
              trip={item}
              onPress={() => router.push('/(app)/summary')}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.green[500]}
            />
          }
        />
      )}
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

  title: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.bold, color: Colors.white[100], paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },

  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.md },

  card: {
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  cardMap: {
    height: 100,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeIllustration: { width: '70%', height: 4, flexDirection: 'row', alignItems: 'center' },
  routeStart: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.green[500] },
  routeLine: { flex: 1, height: 3, backgroundColor: Colors.green[500] },
  routeEnd: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.green[500] },

  cardBody: { padding: Spacing.md, gap: Spacing.sm },
  cardDate: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.white[100] },
  cardPills: { flexDirection: 'row', gap: Spacing.sm },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.bg.elevated,
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  pillText: { fontSize: Typography.size.xs, color: Colors.white[60] },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.white[10] },
  cost: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.white[100] },
  detailsBtn: {
    backgroundColor: Colors.bg.elevated,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: Radius.pill,
  },
  detailsText: { fontSize: Typography.size.sm, color: Colors.white[100] },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingHorizontal: Spacing.xl },
  emptyIcon: { fontSize: 64 },
  emptyTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.white[100] },
  emptyText: { fontSize: Typography.size.sm, color: Colors.white[60], textAlign: 'center', lineHeight: 22 },
})
