import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, type ViewStyle } from 'react-native'
import { Colors, Typography, Radius, Spacing } from '../../../constants'

type Variant = 'primary' | 'danger' | 'ghost'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: Variant
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
}

export function Button({ label, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[styles.base, styles[variant], isDisabled && styles.disabled, style]}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? Colors.bg.primary : Colors.white[100]} size="small" />
        : <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
      }
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  primary: {
    backgroundColor: Colors.green[500],
  },
  danger: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.red[500],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
  primaryLabel: { color: Colors.bg.primary },
  dangerLabel: { color: Colors.red[500] },
  ghostLabel: { color: Colors.white[60] },
})
