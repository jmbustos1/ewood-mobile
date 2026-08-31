import { View, TextInput, Text, StyleSheet, type TextInputProps } from 'react-native'
import { Colors, Typography, Radius, Spacing } from '../../../constants'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error ? styles.inputError : undefined, style]}
        placeholderTextColor={Colors.white[30]}
        selectionColor={Colors.green[500]}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  label: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    color: Colors.white[60],
  },
  input: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.bg.elevated,
    borderWidth: 1,
    borderColor: Colors.white[10],
    paddingHorizontal: Spacing.md,
    fontSize: Typography.size.md,
    color: Colors.white[100],
  },
  inputError: {
    borderColor: Colors.red[500],
  },
  error: {
    fontSize: Typography.size.xs,
    color: Colors.red[500],
  },
})
