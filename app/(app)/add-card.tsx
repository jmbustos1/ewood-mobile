import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { Colors, Typography, Spacing, Radius } from '../../constants'

function formatCardNumber(val: string) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(val: string) {
  const digits = val.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
  return digits
}

export default function AddCardScreen() {
  const router = useRouter()
  const [number, setNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [name, setName] = useState('')

  const isReady = number.replace(/\s/g, '').length === 16 && expiry.length === 5 && cvc.length >= 3 && name.trim().length > 0

  function handleSave() {
    // TODO: integrar con Stripe/pasarela de pagos
    router.back()
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>

        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Tarjeta</Text>

        {/* Campos */}
        <View style={styles.form}>
          <View style={styles.fieldRow}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nombre en la tarjeta"
              placeholderTextColor={Colors.white[30]}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.separator} />

          <View style={styles.fieldRow}>
            <TextInput
              style={styles.input}
              value={number}
              onChangeText={t => setNumber(formatCardNumber(t))}
              placeholder="Número de tarjeta"
              placeholderTextColor={Colors.white[30]}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.separator} />

          <View style={styles.twoCol}>
            <TextInput
              style={[styles.input, styles.inputHalf]}
              value={expiry}
              onChangeText={t => setExpiry(formatExpiry(t))}
              placeholder="MM/AA"
              placeholderTextColor={Colors.white[30]}
              keyboardType="number-pad"
              maxLength={5}
            />
            <View style={styles.colDivider} />
            <TextInput
              style={[styles.input, styles.inputHalf]}
              value={cvc}
              onChangeText={t => setCvc(t.replace(/\D/g, '').slice(0, 4))}
              placeholder="CVC"
              placeholderTextColor={Colors.white[30]}
              keyboardType="number-pad"
              secureTextEntry
            />
          </View>
          <View style={styles.separator} />
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          Confirmo que soy mayor de edad y acepto los{' '}
          <Text style={styles.termsLink}>Términos y Condiciones</Text>.
        </Text>

        <View style={styles.spacer} />

        {/* Botón */}
        <TouchableOpacity
          style={[styles.btn, isReady && styles.btnActive]}
          onPress={handleSave}
          disabled={!isReady}
        >
          <Text style={[styles.btnText, isReady && styles.btnTextActive]}>Guardar Tarjeta</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg.primary },
  container: { flex: 1, paddingTop: 60, padding: Spacing.lg, gap: Spacing.lg },

  backRow: { marginBottom: Spacing.xs },
  backText: { fontSize: Typography.size.sm, color: Colors.white[60] },
  title: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.bold, color: Colors.white[100] },

  form: { gap: 0 },
  fieldRow: { paddingVertical: Spacing.md },
  input: { fontSize: Typography.size.md, color: Colors.white[100] },
  separator: { height: 1, backgroundColor: Colors.white[10] },

  twoCol: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md },
  inputHalf: { flex: 1 },
  colDivider: { width: 1, height: 24, backgroundColor: Colors.white[10], marginHorizontal: Spacing.md },

  terms: { fontSize: Typography.size.sm, color: Colors.white[60], lineHeight: 20 },
  termsLink: { color: Colors.green[400] },

  spacer: { flex: 1 },

  btn: {
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.pill,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnActive: { backgroundColor: Colors.green[500] },
  btnText: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.white[30] },
  btnTextActive: { color: Colors.bg.primary },
})
