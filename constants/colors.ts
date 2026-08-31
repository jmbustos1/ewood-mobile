export const Colors = {
  // Base (fondos) — negro casi puro, sin tinte verde
  bg: {
    primary: '#0A0A0A',
    surface: '#1A1A1A',
    elevated: '#262626',
    overlay: 'rgba(10,10,10,0.85)',
  },

  // Verde — protagonista
  // 400: fluo claro (links, badges activos)
  // 500: fluo principal (CTA buttons)
  // 600: verde marker scooter (medio, igual al SVG)
  // 900: verde muy oscuro (badge backgrounds)
  green: {
    400: '#A8FF35',
    500: '#B4F33C',
    600: '#4DB300',
    900: '#1A3300',
  },

  // Blanco — texto y detalles
  white: {
    100: '#FFFFFF',
    60: 'rgba(255,255,255,0.6)',
    30: 'rgba(255,255,255,0.3)',
    10: 'rgba(255,255,255,0.08)',
  },

  // Amarillo — detalles y alertas
  yellow: {
    400: '#FACC15',
    500: '#EAB308',
    900: '#2A2000',
  },

  // Rojo — errores y estados críticos
  red: {
    500: '#EF4444',
    900: '#2A0A0A',
  },

  // Semánticos
  scooter: {
    available: '#4DB300',
    inUse: '#6B7280',
    offline: '#EF4444',
    low_battery: '#EAB308',
  },
} as const
