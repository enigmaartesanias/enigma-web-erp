const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        amber: colors.amber,
        orange: colors.orange,
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
