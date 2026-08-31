import { View, Text, StyleSheet } from 'react-native'
import { Colors, Typography, Radius, Spacing } from '../../../constants'

interface BatteryBadgeProps {
  level: number
}

export function BatteryBadge({ level }: BatteryBadgeProps) {
  const color = level > 50 ? Colors.green[500] : level > 20 ? Colors.yellow[400] : Colors.red[500]
  const bg = level > 50 ? Colors.green[900] : level > 20 ? Colors.yellow[900] : Colors.red[900]

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>🔋 {level}%</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },
  text: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
  },
})
