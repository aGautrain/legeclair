/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#1976D2', // Professional blue
          secondary: '#1565C0',
          accent: '#82B1FF',
          background: '#dae6f2',
          surface: '#FFFFFF',
          error: '#D32F2F',
          info: '#0288D1',
          success: '#388E3C',
          warning: '#FBC02D',
          'on-primary': '#FFFFFF',
          'on-background': '#212121',
          'on-surface': '#212121',
        },
      },
    },
  },
})
