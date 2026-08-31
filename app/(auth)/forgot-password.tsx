import { useState } from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/presentation/stores/authStore'
import { GradientBackground } from '../../src/presentation/components/GradientBackground'
import { Icon } from '../../src/presentation/components/Icon'
import { Colors, Typography, Spacing, Radius } from '../../constants'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const { forgotPassword, isLoading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const isReady = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  async function handleSend() {
    if (!isReady) return
    await forgotPassword(email.trim())
    if (!error) setSent(true)
  }

  if (sent) {
    return (
      <GradientBackground variant="subtle">
        <View style={styles.container}>
          <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
            <Icon name="left" size={18} color={Colors.white[60]} />
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
          <View style={styles.successBlock}>
            <Text style={styles.successIcon}>✉️</Text>
            <Text style={styles.title}>Revisa tu correo</Text>
            <Text style={styles.subtitle}>
              Si el email <Text style={{ color: Colors.white[100] }}>{email}</Text> existe en nuestra base,
              te enviamos un link para recuperar tu contraseña.{'\n\n'}
              El link expira en 30 minutos.
            </Text>
          </View>
          <View style={styles.spacer} />
          <TouchableOpacity style={[styles.btn, styles.btnActive]} onPress={() => router.replace('/(auth)/login')}>
            <Text style={[styles.btnText, styles.btnTextActive]}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </GradientBackground>
    )
  }

  return (
    <GradientBackground variant="subtle">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
            <Icon name="left" size={18} color={Colors.white[60]} />
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Recupera tu{'\n'}contraseña</Text>
          <Text style={styles.subtitle}>
            Ingresa el correo con el que te registraste y te enviaremos las instrucciones para recuperarla.
          </Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Correo electrónico"
            placeholderTextColor={Colors.white[30]}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            selectionColor={Colors.green[500]}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.spacer} />

          <TouchableOpacity
            style={[styles.btn, isReady && styles.btnActive]}
            onPress={handleSend}
            disabled={!isReady || isLoading}
          >
            <Text style={[styles.btnText, isReady && styles.btnTextActive]}>
              {isLoading ? 'Enviando...' : 'Confirmar'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, padding: Spacing.lg, paddingTop: 60, paddingBottom: 48, gap: Spacing.lg },

  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontSize: Typography.size.sm, color: Colors.white[60] },

  title: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.bold, color: Colors.white[100], lineHeight: 40 },
  subtitle: { fontSize: Typography.size.sm, color: Colors.white[60], lineHeight: 22 },

  input: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.bg.elevated,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.size.md,
    color: Colors.white[100],
    marginTop: Spacing.sm,
  },
  error: { fontSize: Typography.size.sm, color: Colors.red[500] },

  spacer: { flex: 1 },

  btn: {
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.pill,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnActive: { backgroundColor: Colors.green[500] },
  btnText: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.white[30] },
  btnTextActive: { color: Colors.bg.primary },

  successBlock: { gap: Spacing.md, alignItems: 'center', marginTop: 80 },
  successIcon: { fontSize: 64 },
})
