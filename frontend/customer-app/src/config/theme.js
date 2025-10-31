// Modern Theme Configuration for Peraxis Customer App
export const themeConfig = {
  colors: {
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
  },
  typography: {
    fontFamily: {
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: "'Poppins', 'Inter', sans-serif",
    },
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
}

export default themeConfig
