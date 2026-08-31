import { useState } from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Icon } from '../../src/presentation/components/Icon'
import { Colors, Typography, Spacing, Radius } from '../../constants'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.exwood.dev'
const MIN_LEN = 8

export default function ResetPasswordScreen() {
  const router = useRouter()
  const { token } = useLocalSearchParams<{ token?: string }>()

  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showNext, setShowNext] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const match = next.length > 0 && next === confirm
  const longEnough = next.length >= MIN_LEN
  const canSubmit = match && longEnough && !!token && !loading

  async function handleSubmit() {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: next }),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) {
        setError((data as any)?.error ?? 'Error al actualizar la contraseña')
        return
      }
      Alert.alert(
        'Listo',
        'Tu contraseña se actualizó. Ya puedes iniciar sesión.',
        [{ text: 'Ir a iniciar sesión', onPress: () => router.replace('/(auth)/login') }],
      )
    } catch {
      setError('Error de conexión. Revisa tu internet.')
    } finally {
      setLoading(false)
    }
  }

  // Token faltante -> pantalla de link invalido
  if (!token) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backRow} onPress={() => router.replace('/(auth)/login')}>
          <Icon name="left" size={18} color={Colors.white[60]} />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Link{'\n'}inválido</Text>
        <Text style={styles.helperTop}>
          Este link de recuperación no tiene el código de seguridad. Solicita el correo de nuevo.
        </Text>
        <View style={styles.spacer} />
        <TouchableOpacity style={[styles.btn, styles.btnActive]} onPress={() => router.replace('/(auth)/forgot-password')}>
          <Text style={[styles.btnText, styles.btnTextActive]}>Solicitar de nuevo</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backRow} onPress={() => router.replace('/(auth)/login')}>
          <Icon name="left" size={18} color={Colors.white[60]} />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Nueva{'\n'}Contraseña</Text>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.field}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={next}
                onChangeText={setNext}
                placeholder="Contraseña nueva"
                placeholderTextColor={Colors.white[60]}
                secureTextEntry={!showNext}
                autoCapitalize="none"
                selectionColor={Colors.green[500]}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowNext(v => !v)}>
                <Icon name={showNext ? 'eye' : 'eye-off'} size={20} color={Colors.white[60]} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Repite la contraseña"
                placeholderTextColor={Colors.white[60]}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                selectionColor={Colors.green[500]}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(v => !v)}>
                <Icon name={showConfirm ? 'eye' : 'eye-off'} size={20} color={Colors.white[60]} />
              </TouchableOpacity>
            </View>
          </View>

          {next.length > 0 && !longEnough && (
            <Text style={styles.errText}>Mínimo {MIN_LEN} caracteres.</Text>
          )}
          {confirm.length > 0 && !match && (
            <Text style={styles.errText}>Las contraseñas no coinciden.</Text>
          )}
          {error && <Text style={styles.errText}>{error}</Text>}
        </ScrollView>

        <TouchableOpacity
          style={[styles.btn, canSubmit && styles.btnActive]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          <Text style={[styles.btnText, canSubmit && styles.btnTextActive]}>
            {loading ? 'Guardando...' : 'Cambiar y Guardar'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg.primary },
  container: { flex: 1, backgroundColor: Colors.bg.primary, paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: 40, gap: Spacing.md },

  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontSize: Typography.size.sm, color: Colors.white[60] },
  title: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.bold, color: Colors.white[100], lineHeight: 40, marginBottom: Spacing.md },
  helperTop: { fontSize: Typography.size.sm, color: Colors.white[60], lineHeight: 22 },

  scroll: { gap: Spacing.lg, paddingBottom: Spacing.xl },

  field: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.white[10],
    paddingBottom: Spacing.xs,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  input: {
    flex: 1,
    fontSize: Typography.size.md,
    color: Colors.white[100],
    paddingVertical: Spacing.sm,
  },
  eyeBtn: { padding: 4 },

  errText: { fontSize: Typography.size.sm, color: Colors.red[500] },

  spacer: { flex: 1 },

  btn: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.pill,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnActive: { backgroundColor: Colors.green[500] },
  btnText: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.white[60] },
  btnTextActive: { color: Colors.bg.primary },
})
