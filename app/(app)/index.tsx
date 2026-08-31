import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/presentation/stores/authStore'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants'

const LOGO = require('../../assets/logo-exwood.png')

/**
 * Home (tab "Inicio") — Dashboard Consumer PENDIENTE.
 *
 * Cuando se implemente el Dashboard Consumer (assets en
 * dashboard_screens/Dashboard Consumer - OFF/ON/warning), esta pantalla
 * va a mostrar:
 *  - Estado del scooter (OFF / EN VIAJE / con warning low salary)
 *  - Saldo actual
 *  - Acceso rápido al mapa
 *  - Historial de viajes resumido
 *
 * Por ahora es una landing minimal con accesos rápidos.
 */
export default function HomeScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const initial = user?.name?.[0]?.toUpperCase() ?? '?'

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity style={styles.avatar} onPress={() => router.push('/(app)/profile')}>
          <Text style={styles.avatarText}>{initial}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Hola, {user?.name?.split(' ')[0] ?? 'rider'} 👋</Text>
        <Text style={styles.subtitle}>¿Listo para tu próximo viaje?</Text>

        <TouchableOpacity style={[styles.bigCard, Shadow.card]} onPress={() => router.push('/(app)/map')}>
          <Text style={styles.cardIcon}>🛴</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Buscar scooter</Text>
            <Text style={styles.cardBody}>Encuentra el más cercano y empieza a moverte.</Text>
          </View>
          <Text style={styles.cardArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.grid}>
          <TouchableOpacity style={[styles.smallCard, Shadow.card]} onPress={() => router.push('/(app)/wallet')}>
            <Text style={styles.smallIcon}>💰</Text>
            <Text style={styles.smallLabel}>Saldo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.smallCard, Shadow.card]} onPress={() => router.push('/(app)/history')}>
            <Text style={styles.smallIcon}>📜</Text>
            <Text style={styles.smallLabel}>Historial</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pendingNote}>
          <Text style={styles.pendingTitle}>Dashboard completo · próximamente</Text>
          <Text style={styles.pendingBody}>
            Vas a ver el estado de tu scooter en uso, saldo restante en tiempo real y avisos del sistema.
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.md,
  },
  headerSide: { width: 36 },
  logo: { width: 110, height: 28 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.green[900],
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: Typography.weight.bold, color: Colors.green[500] },

  scroll: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 120 },

  greeting: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.bold, color: Colors.white[100] },
  subtitle: { fontSize: Typography.size.sm, color: Colors.white[60], marginTop: -Spacing.sm },

  bigCard: {
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cardIcon: { fontSize: 40 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.white[100] },
  cardBody: { fontSize: Typography.size.sm, color: Colors.white[60], marginTop: 2 },
  cardArrow: { fontSize: Typography.size['2xl'], color: Colors.white[30] },

  grid: { flexDirection: 'row', gap: Spacing.md },
  smallCard: {
    flex: 1,
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  smallIcon: { fontSize: 28 },
  smallLabel: { fontSize: Typography.size.sm, fontWeight: Typography.weight.medium, color: Colors.white[100] },

  pendingNote: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.green[500],
    gap: 4,
  },
  pendingTitle: { fontSize: Typography.size.sm, fontWeight: Typography.weight.bold, color: Colors.white[100] },
  pendingBody: { fontSize: Typography.size.xs, color: Colors.white[60], lineHeight: 18 },
})
