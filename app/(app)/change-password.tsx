import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { Icon } from '../../src/presentation/components/Icon'
import { Colors, Typography, Spacing, Radius } from '../../constants'

const MIN_PASSWORD_LEN = 8

export default function ChangePasswordScreen() {
  const router = useRouter()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const isValid = current.length > 0 && next.length >= MIN_PASSWORD_LEN

  async function handleSubmit() {
    if (!isValid) return
    setSubmitting(true)
    try {
      // TODO: backend endpoint pendiente — POST /auth/change-password con { current, new }
      await new Promise(r => setTimeout(r, 600))
      Alert.alert(
        'Contraseña actualizada',
        'El endpoint del backend aún está pendiente. Tu contraseña no se cambió.',
        [{ text: 'OK', onPress: () => router.back() }]
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Icon name="left" size={18} color={Colors.white[60]} />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Cambiar{'\n'}Contraseña</Text>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.field}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={current}
                onChangeText={setCurrent}
                placeholder="Contraseña actual"
                placeholderTextColor={Colors.white[60]}
                secureTextEntry={!showCurrent}
                autoCapitalize="none"
                selectionColor={Colors.green[500]}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowCurrent(v => !v)}>
                <Icon name={showCurrent ? 'eye' : 'eye-off'} size={20} color={Colors.white[60]} />
              </TouchableOpacity>
            </View>
          </View>

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

          <View style={styles.forgotBlock}>
            <Text style={styles.forgotTitle}>¿Olvidaste tu contraseña?</Text>
            <TouchableOpacity
              style={styles.forgotLinkRow}
              onPress={() => Alert.alert('Recuperación', 'La recuperación por email requiere SendGrid/Brevo, que aún está pendiente de integrar.')}
            >
              <Icon name="mail" size={16} color={Colors.green[500]} />
              <Text style={styles.forgotLink}>Recibe un correo para restablecerla.</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[styles.btn, isValid && styles.btnActive]}
          onPress={handleSubmit}
          disabled={!isValid || submitting}
        >
          <Text style={[styles.btnText, isValid && styles.btnTextActive]}>
            {submitting ? 'Actualizando...' : 'Cambiar y Guardar'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg.primary },
  container: { flex: 1, paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: 40, gap: Spacing.md },

  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontSize: Typography.size.sm, color: Colors.white[60] },
  title: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.bold, color: Colors.white[100], lineHeight: 40, marginBottom: Spacing.md },

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

  forgotBlock: { gap: 6 },
  forgotTitle: { fontSize: Typography.size.sm, color: Colors.white[60] },
  forgotLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  forgotLink: { fontSize: Typography.size.sm, fontWeight: Typography.weight.bold, color: Colors.green[500] },

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
