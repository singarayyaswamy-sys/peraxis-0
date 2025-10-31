# Peraxis Customer App 🛍️

A modern, AI-powered e-commerce customer application built with React, Vite, and cutting-edge web technologies.

## ✨ Features

### 🎨 Modern UI/UX
- **Glass Morphism Design** - Beautiful translucent interfaces with backdrop blur
- **Premium Gradients** - Aurora, neon, and custom gradient backgrounds
- **Smooth Animations** - Framer Motion powered micro-interactions
- **Dark Mode Support** - Seamless light/dark theme switching
- **Responsive Design** - Mobile-first approach with perfect scaling

### 🚀 Performance
- **Lazy Loading** - Code splitting for optimal bundle sizes
- **Image Optimization** - WebP support with fallbacks
- **Service Worker** - PWA capabilities with offline support
- **Virtual Scrolling** - Handle large product lists efficiently
- **Prefetching** - Smart resource preloading

### 🔒 Security
- **XSS Protection** - DOMPurify integration for safe content
- **CSRF Protection** - Token-based request validation
- **Input Sanitization** - Comprehensive data cleaning
- **Rate Limiting** - Client-side request throttling
- **Content Security Policy** - Strict CSP headers

### 🤖 AI Integration
- **Smart Recommendations** - Personalized product suggestions
- **Intelligent Search** - AI-powered search with suggestions
- **Behavioral Analytics** - User activity tracking and insights
- **Dynamic Pricing** - Real-time price optimization

### 📱 Progressive Web App
- **Offline Support** - Works without internet connection
- **Push Notifications** - Real-time order updates
- **App-like Experience** - Native app feel in browser
- **Install Prompt** - Add to home screen functionality

## 🛠️ Tech Stack

### Core
- **React 18.3** - Latest React with concurrent features
- **Vite 5.3** - Lightning-fast build tool
- **TypeScript** - Type-safe development (optional)

### Styling
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Framer Motion 11** - Production-ready motion library
- **Headless UI 2.0** - Unstyled, accessible UI components

### State Management
- **Zustand 4.5** - Lightweight state management
- **TanStack Query 5** - Powerful data fetching and caching
- **React Hook Form 7** - Performant forms with easy validation

### Development
- **ESLint** - Code linting with security rules
- **Prettier** - Code formatting
- **Vitest** - Fast unit testing
- **Storybook** - Component development environment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+ or yarn 1.22+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd peraxis-customer-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8087

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_AI_FEATURES=true

# External Services
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key

# Development
VITE_MOCK_API=false
VITE_DEBUG_MODE=true
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI elements (Button, Input, etc.)
│   ├── layout/         # Layout components (Header, Footer)
│   ├── product/        # Product-specific components
│   ├── location/       # Location and maps components
│   └── realtime/       # Real-time features
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   └── ...             # Other pages
├── hooks/              # Custom React hooks
├── services/           # API services and external integrations
├── store/              # State management (Zustand stores)
├── utils/              # Utility functions
│   ├── security.js     # Security utilities
│   ├── cn.js          # Class name utilities
│   └── ...            # Other utilities
├── assets/             # Static assets
└── tests/              # Test files
```

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
--success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

/* Glass Morphism */
--glass-bg: rgba(255, 255, 255, 0.15);
--glass-border: rgba(255, 255, 255, 0.2);
--glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
```

### Typography
- **Primary Font**: Inter (System font fallback)
- **Display Font**: Poppins
- **Monospace**: JetBrains Mono

### Components

#### Button Variants
```jsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="glass">Glass</Button>
<Button variant="neon">Neon</Button>
<Button variant="gradient">Gradient</Button>
```

#### Loading States
```jsx
<LoadingSpinner variant="default" size="lg" />
<LoadingSpinner variant="dots" />
<LoadingSpinner variant="pulse" />
<LoadingSpinner variant="bars" />
<LoadingSpinner variant="gradient" />
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run dev:host         # Start dev server with network access

# Building
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage

# Linting
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues

# Security
npm run security:audit   # Run security audit
```

### Code Quality

The project enforces high code quality standards:

- **ESLint** with React, accessibility, and security rules
- **Prettier** for consistent code formatting
- **Husky** for git hooks
- **Lint-staged** for pre-commit linting
- **Conventional Commits** for standardized commit messages

### Testing Strategy

```bash
# Unit Tests
npm run test

# Component Tests
npm run test:components

# Integration Tests
npm run test:integration

# E2E Tests (Playwright)
npm run test:e2e
```

## 🚀 Deployment

### Build Optimization

The build process includes:
- **Code Splitting** - Automatic route-based splitting
- **Tree Shaking** - Remove unused code
- **Asset Optimization** - Image compression and format conversion
- **Bundle Analysis** - Size analysis and optimization suggestions

### Production Build

```bash
# Build for production
npm run build

# Analyze bundle size
npm run analyze

# Preview production build
npm run preview
```

### Deployment Targets

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Netlify
```bash
# Build command: npm run build
# Publish directory: dist
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🔒 Security

### Security Features
- **Content Security Policy** - Prevents XSS attacks
- **CSRF Protection** - Token-based request validation
- **Input Sanitization** - DOMPurify integration
- **Rate Limiting** - Prevents abuse
- **Secure Headers** - HSTS, X-Frame-Options, etc.

### Security Checklist
- [ ] Environment variables secured
- [ ] API endpoints validated
- [ ] User inputs sanitized
- [ ] HTTPS enforced in production
- [ ] Dependencies regularly updated
- [ ] Security headers configured

## 📊 Performance

### Core Web Vitals
- **LCP** < 2.5s (Largest Contentful Paint)
- **FID** < 100ms (First Input Delay)
- **CLS** < 0.1 (Cumulative Layout Shift)

### Optimization Techniques
- Lazy loading for routes and images
- Service worker for caching
- Resource preloading
- Bundle splitting
- Image optimization

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

### Commit Convention
```
feat: add new product filter component
fix: resolve cart calculation bug
docs: update API documentation
style: improve button hover animations
refactor: optimize search performance
test: add unit tests for auth service
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Component Library](./docs/components.md)
- [API Reference](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)

### Getting Help
- 📧 Email: support@peraxis.com
- 💬 Discord: [Join our community](https://discord.gg/peraxis)
- 📖 Wiki: [Project Wiki](https://github.com/peraxis/wiki)

### Reporting Issues
Please use the [GitHub Issues](https://github.com/peraxis/issues) page to report bugs or request features.

---

**Built with ❤️ by the Peraxis Team**