module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#7C3AED',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        bg: '#F8FAFC',
        card: '#FFFFFF',
        text: '#0F172A'
      },
      borderRadius: {
        'lg-20': '20px'
      }
    }
  },
  plugins: []
}
