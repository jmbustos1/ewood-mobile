import { ImageBackground, StyleSheet, type ReactNode } from 'react-native'

const BG_MAIN = require('../../../assets/background-onboarding.png')
const BG_SUBTLE = require('../../../assets/background-onboarding-2.png')

interface Props {
  variant?: 'main' | 'subtle'
  children: ReactNode
}

export function GradientBackground({ variant = 'main', children }: Props) {
  return (
    <ImageBackground
      source={variant === 'main' ? BG_MAIN : BG_SUBTLE}
      style={styles.bg}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
})
