import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Colors, Typography, Spacing, Radius } from '../../constants'

/**
 * Pantalla full-screen para mostrar resultado de pago (post-viaje o post-recarga).
 *
 * Params:
 *  - status: 'success' | 'fail' (default 'success')
 *  - returnTo: ruta a la que vuelve "Volver al Mapa" (default /(app)/map)
 *  - retryRoute: ruta a la que va "Reintentar Pago" en caso fail (default /(app)/summary)
 */
export default function PaymentResultScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ status?: string; returnTo?: string; retryRoute?: string }>()

  const isSuccess = params.status !== 'fail'
  const returnTo = params.returnTo ?? '/(app)/map'
  const retryRoute = params.retryRoute ?? '/(app)/summary'

  function handlePrimary() {
    if (isSuccess) router.replace(returnTo as any)
    else router.replace(retryRoute as any)
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.icon, isSuccess ? styles.iconSuccess : styles.iconFail]}>
          {isSuccess ? '✓' : '✕'}
        </Text>
        <Text style={styles.title}>{isSuccess ? '¡Pago Realizado!' : 'Pago pendiente'}</Text>
        <Text style={styles.body}>
          {isSuccess
            ? 'Gracias por tu viaje. ¡Te esperamos pronto!'
            : 'No pudimos procesar tu pago. Intenta nuevamente.'}
        </Text>
        <TouchableOpacity style={styles.btn} onPress={handlePrimary}>
          <Text style={styles.btnText}>
            {isSuccess ? 'Volver al Mapa' : 'Reintentar Pago'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  content: { alignItems: 'center', gap: Spacing.md, maxWidth: 320 },
  icon: { fontSize: 64, fontWeight: Typography.weight.bold, marginBottom: Spacing.sm },
  iconSuccess: { color: Colors.white[100] },
  iconFail: { color: Colors.white[100] },
  title: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.bold, color: Colors.white[100], textAlign: 'center' },
  body: { fontSize: Typography.size.sm, color: Colors.white[60], textAlign: 'center', lineHeight: 22, marginBottom: Spacing.lg },
  btn: {
    backgroundColor: Colors.green[500],
    borderRadius: Radius.pill,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    minWidth: 200,
    alignItems: 'center',
  },
  btnText: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.bg.primary },
})
