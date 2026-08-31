import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants'

// Mock — reemplazar con estado real cuando haya backend de pagos
const MOCK_CARD = {
  name: 'Nancy Doe',
  last4: '20',
  expiry: '08/28',
}

export default function PaymentMethodsScreen() {
  const router = useRouter()
  // Toggle para simular con/sin tarjeta
  const hasCard = false // cambiar a true para ver el estado con tarjeta

  function handleDelete() {
    Alert.alert('Eliminar tarjeta', '¿Estás segura de que quieres eliminar esta tarjeta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => {} },
    ])
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
        <Text style={styles.backText}>‹ Volver</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Métodos de Pago</Text>

      {hasCard ? (
        <>
          {/* Tarjeta guardada */}
          <View style={[styles.card, Shadow.card]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardSaved}>Tarjeta Guardada</Text>
              <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/(app)/add-card')}>
                <Text style={styles.editBtnText}>✏ Editar</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.cardName}>{MOCK_CARD.name}</Text>
            <View style={styles.cardBottom}>
              <Text style={styles.cardNumber}>•••• •••• •••• {MOCK_CARD.last4}</Text>
              <Text style={styles.cardExpiry}>{MOCK_CARD.expiry}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.deleteRow} onPress={handleDelete}>
            <Text style={styles.deleteText}>🗑 Eliminar Tarjeta</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* Estado vacío */}
          <Text style={styles.emptyText}>Para empezar a moverte, primero agrega una tarjeta a tu cuenta.</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(app)/add-card')}>
            <Text style={styles.addBtnText}>+ Agregar Tarjeta</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary, paddingTop: 60, padding: Spacing.lg, gap: Spacing.lg },

  backRow: { marginBottom: Spacing.xs },
  backText: { fontSize: Typography.size.sm, color: Colors.white[60] },
  title: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.bold, color: Colors.white[100] },

  emptyText: { fontSize: Typography.size.sm, color: Colors.white[60], lineHeight: 22 },

  addBtn: {
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
  },
  addBtnText: { fontSize: Typography.size.md, fontWeight: Typography.weight.medium, color: Colors.white[100] },

  // Card con gradiente visual simulado
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: Colors.green[500],
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardSaved: { fontSize: Typography.size.sm, fontWeight: Typography.weight.bold, color: Colors.bg.primary },
  editBtn: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },
  editBtnText: { fontSize: Typography.size.xs, color: Colors.bg.primary, fontWeight: Typography.weight.medium },
  cardName: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.bg.primary },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardNumber: { fontSize: Typography.size.sm, color: Colors.bg.primary },
  cardExpiry: { fontSize: Typography.size.sm, color: Colors.bg.primary, fontWeight: Typography.weight.bold },

  deleteRow: { alignItems: 'center' },
  deleteText: { fontSize: Typography.size.sm, color: Colors.red[500] },
})
