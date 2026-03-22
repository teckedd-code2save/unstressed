const { hairlineWidth } = require('nativewind/theme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ── Serene Logic (Light) + Midnight Sanctuary (Dark) ──
        // Primary
        primary: {
          DEFAULT: '#156a67',
          dim: '#005d5a',
          fixed: '#a5f0eb',
          'fixed-dim': '#97e2dd',
          container: '#a5f0eb',
        },
        'on-primary': '#e1fffc',
        'on-primary-container': '#005c59',
        'on-primary-fixed': '#004845',
        'on-primary-fixed-variant': '#0e6663',
        'inverse-primary': '#abf6f1',

        // Secondary
        secondary: {
          DEFAULT: '#4f626d',
          dim: '#435661',
          fixed: '#d2e5f3',
          'fixed-dim': '#c4d7e4',
          container: '#d2e5f3',
        },
        'on-secondary': '#f4faff',
        'on-secondary-container': '#42545f',
        'on-secondary-fixed': '#30424c',
        'on-secondary-fixed-variant': '#4c5e69',

        // Tertiary
        tertiary: {
          DEFAULT: '#655e51',
          dim: '#595245',
          fixed: '#f7eddb',
          'fixed-dim': '#e9decd',
          container: '#f7eddb',
        },
        'on-tertiary': '#fff8ef',
        'on-tertiary-container': '#5e584a',
        'on-tertiary-fixed': '#4c4639',
        'on-tertiary-fixed-variant': '#696254',

        // Surface hierarchy (light)
        surface: {
          DEFAULT: '#faf9f6',
          dim: '#d9dbd6',
          bright: '#faf9f6',
          variant: '#e1e3de',
          tint: '#156a67',
          'container-lowest': '#ffffff',
          'container-low': '#f4f4f0',
          container: '#eeeeea',
          'container-high': '#e8e9e4',
          'container-highest': '#e1e3de',
        },
        'on-surface': '#303330',
        'on-surface-variant': '#5d605c',
        'inverse-surface': '#0d0f0d',
        'inverse-on-surface': '#9d9d9a',

        // Dark surface hierarchy (Midnight Sanctuary)
        dark: {
          surface: '#121412',
          'surface-dim': '#0d0f0d',
          'surface-container-lowest': '#0d0f0d',
          'surface-container-low': '#1a1c1a',
          'surface-container': '#1e201e',
          'surface-container-high': '#282a28',
          'surface-container-highest': '#333533',
          'surface-bright': '#383a37',
          'on-surface': '#e2e3df',
          'on-surface-variant': '#bfc8c8',
          primary: '#93d2d1',
          'on-primary': '#003737',
          'primary-container': '#5d9b9b',
        },

        // Outline
        outline: {
          DEFAULT: '#797b78',
          variant: '#b0b3ae',
        },

        // Error
        error: {
          DEFAULT: '#a83836',
          dim: '#67040d',
          container: '#fa746f',
        },
        'on-error': '#fff7f6',
        'on-error-container': '#6e0a12',

        // Background
        background: '#faf9f6',
        'on-background': '#303330',
      },

      fontFamily: {
        headline: ['Manrope_700Bold'],
        'headline-medium': ['Manrope_600SemiBold'],
        body: ['Manrope_400Regular'],
        'body-medium': ['Manrope_500Medium'],
        label: ['Manrope_600SemiBold'],
        'label-light': ['Manrope_300Light'],
      },

      borderRadius: {
        DEFAULT: '4px',
        sm: '4px',
        md: '8px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
        full: '9999px',
      },

      borderWidth: {
        hairline: hairlineWidth(),
      },

      boxShadow: {
        // Ambient teal glow (Midnight Sanctuary)
        glow: '0 0 32px 0 rgba(147,210,209,0.08)',
        'glow-lg': '0 0 48px 0 rgba(147,210,209,0.12)',
        card: '0 4px 20px 0 rgba(48,51,48,0.06)',
        'card-dark': '0 4px 32px 0 rgba(0,0,0,0.24)',
      },

      spacing: {
        18: '72px',
        22: '88px',
        30: '120px',
      },
    },
  },
  plugins: [],
}
