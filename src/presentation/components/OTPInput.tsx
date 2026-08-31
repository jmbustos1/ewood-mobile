import { useRef, useState } from 'react'
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native'
import { Colors, Typography, Radius, Spacing } from '../../../constants'

interface Props {
  length?: number
  value: string
  onChange: (val: string) => void
}

export function OTPInput({ length = 4, value, onChange }: Props) {
  const inputs = useRef<(TextInput | null)[]>([])

  function handleChange(text: string, index: number) {
    const digit = text.replace(/[^0-9A-Za-z]/g, '').slice(-1).toUpperCase()
    const chars = value.split('')
    chars[index] = digit
    const next = chars.join('').slice(0, length)
    onChange(next)
    if (digit && index < length - 1) {
      inputs.current[index + 1]?.focus()
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !value[index] && index > 0) {
      const chars = value.split('')
      chars[index - 1] = ''
      onChange(chars.join(''))
      inputs.current[index - 1]?.focus()
    }
  }

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => (
        <Pressable key={i} onPress={() => inputs.current[i]?.focus()} style={[styles.box, value[i] ? styles.boxFilled : null]}>
          <TextInput
            ref={r => { inputs.current[i] = r }}
            style={styles.input}
            value={value[i] ?? ''}
            onChangeText={t => handleChange(t, i)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
            maxLength={1}
            keyboardType="number-pad"
            selectTextOnFocus
          />
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.md, justifyContent: 'center' },
  box: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
    backgroundColor: Colors.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: {
    backgroundColor: Colors.bg.elevated,
  },
  input: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.white[100],
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
})
