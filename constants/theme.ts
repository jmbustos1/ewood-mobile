import { Colors } from './colors'

export const Typography = {
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    '2xl': 32,
    xxl: 40,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
  },
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const Radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 9999,
}

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 16,
  },
}

// Estilos de texto reutilizables
export const TextStyles = {
  screenTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.white[100],
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.white[100],
  },
  subtitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.medium,
    color: Colors.white[100],
  },
  body: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.regular,
    color: Colors.white[60],
  },
  caption: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.regular,
    color: Colors.white[60],
  },
  buttonPrimary: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.bg.primary,
  },
  buttonSecondary: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.medium,
    color: Colors.white[100],
  },
}
