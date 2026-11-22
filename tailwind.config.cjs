const colors = require('tailwindcss/colors');

module.exports = {
  purge: ['./index.html', './src/**/*.{js,jsx}'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        amber: colors.amber,
        orange: colors.orange,
        emerald: colors.emerald,
        rose: colors.rose,
        teal: colors.teal,
        cyan: colors.cyan,
        lime: colors.lime,
        violet: colors.violet,
        sky: colors.sky,
        fuchsia: colors.fuchsia,
        enigma: {
          panel: '#ffffff',
          text: '#1a1a1a',
          secundario: '#b09070',
          dorado: '#c8964a',
          'crema-suave': '#fdf9f5',
          bordes: '#ede8e2',
          'icon-cobre': '#fdf0e0',
          'icon-plata': '#f0f0f0',
          'icon-alpaca': '#eef4f0',
        }
      },
    },
  },
  variants: {
    extend: {
      display: ['group-hover'],
    },
  },
  plugins: [],
}
