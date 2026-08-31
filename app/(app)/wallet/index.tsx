import { useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { useWalletStore } from '../../../src/presentation/stores/walletStore'
import { Colors, Typography, Spacing, Radius } from '../../../constants'

function formatCLP(n: number) {
  return '$' + Math.abs(Math.round(n)).toLocaleString('es-CL')
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const date = d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const time = d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
  return `${date}, ${time}`
}

export default function WalletScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ negativeBalance?: string }>()
  const { balance, canRent, transactions, isLoading, loadWallet } = useWalletStore()

  const showNegativeBanner = params.negativeBalance === '1' || !canRent

  useFocusEffect(
    useCallback(() => {
      loadWallet()
    }, [])
  )

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
        <Text style={styles.backText}>‹ Volver</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Saldo</Text>

      {showNegativeBanner && (
        <View style={styles.negativeBanner}>
          <Text style={styles.negativeBannerText}>
            Tu saldo está en negativo. Recarga para poder arrendar de nuevo.
          </Text>
        </View>
      )}

      <View style={styles.balanceCard}>
        <View style={styles.balanceTextBlock}>
          <Text style={styles.balanceLabel}>Saldo Ewood</Text>
          <Text style={[styles.balanceAmount, balance < 0 && styles.balanceNegative]}>
            {balance < 0 ? '-' : ''}{formatCLP(balance)}
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(app)/wallet/recharge')}>
          <Text style={styles.addBtnText}>+ Agregar Saldo</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Historial de movimientos</Text>

      {isLoading ? (
        <ActivityIndicator color={Colors.green[500]} style={{ marginTop: Spacing.lg }} />
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {transactions.length === 0 ? (
            <Text style={styles.emptyText}>Aún no hay movimientos.</Text>
          ) : (
            transactions.map(tx => (
              <View key={tx.id} style={styles.txRow}>
                <Text style={styles.txDate}>{formatDate(tx.createdAt)}</Text>
                <Text style={[styles.txAmount, tx.amount < 0 && styles.txAmountNegative]}>
                  {formatCLP(tx.amount)}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary, paddingTop: 60, paddingHorizontal: Spacing.lg, gap: Spacing.md },

  backRow: { marginBottom: Spacing.xs },
  backText: { fontSize: Typography.size.sm, color: Colors.white[60] },
  title: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.bold, color: Colors.white[100] },

  negativeBanner: {
    backgroundColor: Colors.red[900],
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.red[500],
  },
  negativeBannerText: {
    color: Colors.red[500],
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },

  balanceCard: {
    backgroundColor: Colors.bg.surface,
    borderRadius: 24,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  balanceTextBlock: { flex: 1 },
  balanceLabel: { fontSize: Typography.size.sm, color: Colors.white[60] },
  balanceAmount: { fontSize: 28, fontWeight: Typography.weight.bold, color: Colors.white[100], marginTop: 2 },
  balanceNegative: { color: Colors.red[500] },

  addBtn: {
    backgroundColor: Colors.bg.elevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderRadius: Radius.pill,
  },
  addBtnText: { fontSize: Typography.size.sm, color: Colors.white[100], fontWeight: Typography.weight.bold },

  sectionTitle: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.white[100], marginTop: Spacing.sm },

  list: { flex: 1 },
  listContent: { paddingBottom: Spacing.xl },
  emptyText: { fontSize: Typography.size.sm, color: Colors.white[60], textAlign: 'center', marginTop: Spacing.xl },

  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.white[10],
  },
  txDate: { fontSize: Typography.size.sm, color: Colors.white[60] },
  txAmount: { fontSize: Typography.size.md, fontWeight: Typography.weight.medium, color: Colors.white[100] },
  txAmountNegative: { color: Colors.red[500] },
})
