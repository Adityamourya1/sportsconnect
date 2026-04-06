module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4CAF50',
        secondary: '#F5DEB3',
      },
      gradients: {
        'beige-green': 'linear-gradient(135deg, #F5DEB3 0%, #4CAF50 100%)',
      }
    },
  },
  plugins: [],
}
