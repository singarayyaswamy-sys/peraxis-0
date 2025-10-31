# 🚀 Quick Start Guide - Peraxis Customer App

## ✅ Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Backend services running (or configured API URL)

## 📦 Installation

```bash
# Navigate to customer-app directory
cd frontend/customer-app

# Install dependencies
npm install
```

## 🔧 Configuration

### Environment Variables
Create or update `.env` file:

```env
# API Configuration
VITE_API_URL=http://localhost:8080/api

# Feature Flags
VITE_ENABLE_DEVTOOLS=true
VITE_LOG_LEVEL=debug

# Optional: Google Maps API Key (for location features)
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## 🏃 Running the App

### Development Mode
```bash
npm run dev
```
Opens at: http://localhost:3000

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🔍 Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues

# Security
npm audit                # Check for vulnerabilities
npm run security:audit   # Detailed security audit

# Testing (if configured)
npm run test             # Run tests
npm run test:ui          # Run tests with UI
```

## 🌐 Access Points

Once running, access the app at:
- **Local:** http://localhost:3000
- **Network:** http://0.0.0.0:3000 (accessible from other devices)

## 🎯 Key Features to Test

### 1. Security Features ✅
- All inputs are sanitized
- CSRF protection on all requests
- Rate limiting implemented
- Secure API calls

### 2. UI/UX Features ✨
- Modern gradient design
- Smooth animations
- Dark mode toggle
- Responsive layout
- Glass morphism effects

### 3. Performance Features ⚡
- Lazy loaded pages
- Image lazy loading
- Skeleton loaders
- Optimized bundle size

### 4. Functional Features 🛍️
- Product browsing
- AI-powered search
- Shopping cart
- Wishlist
- User authentication
- Order tracking

## 🐛 Troubleshooting

### Issue: Port 3000 already in use
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
npm run dev -- --port 3001
```

### Issue: Module not found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Build fails
```bash
# Check Node version
node --version  # Should be 18+

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Issue: API connection fails
- Ensure backend services are running
- Check VITE_API_URL in .env
- Verify CORS settings on backend

## 📱 Testing on Mobile

### Local Network Access
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Access from mobile: `http://YOUR_IP:3000`
3. Ensure firewall allows port 3000

### Responsive Testing
- Chrome DevTools: F12 → Toggle Device Toolbar
- Test breakpoints: 475px, 640px, 768px, 1024px, 1280px, 1536px

## 🎨 Customization

### Theme Colors
Edit `src/config/theme.js` or `tailwind.config.js`

### Animations
Modify `src/index.css` for custom animations

### Components
Add new components in `src/components/`

## 📊 Performance Monitoring

### Development
- React Query Devtools: Bottom-right corner
- Console logs: Network requests and errors

### Production
- Lighthouse audit: Chrome DevTools → Lighthouse
- Bundle analyzer: `npm run build -- --analyze`

## 🔒 Security Notes

### Before Production
1. Update `.env` with production API URL
2. Set `VITE_ENABLE_DEVTOOLS=false`
3. Run `npm audit fix`
4. Test all security features
5. Enable HTTPS

### Environment Variables
Never commit `.env` file with sensitive data!

## 📚 Documentation

- `IMPROVEMENTS.md` - All improvements made
- `SECURITY_FIXES.md` - Security fixes details
- `README_IMPROVEMENTS.md` - Complete overview
- `CHECKLIST.md` - Verification checklist

## 🆘 Common Issues & Solutions

### 1. Vite Config Error
**Error:** Dynamic require not supported
**Solution:** Already fixed - postcss config moved to postcss.config.js

### 2. Tailwind Not Working
**Solution:** 
```bash
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
```

### 3. React Query Issues
**Solution:**
```bash
npm install @tanstack/react-query@latest
```

### 4. Framer Motion Errors
**Solution:**
```bash
npm install framer-motion@latest
```

## 🎯 Next Steps

1. ✅ Start development server
2. ✅ Test all features
3. ✅ Customize theme/branding
4. ✅ Connect to backend APIs
5. ✅ Test on multiple devices
6. ✅ Run security audit
7. ✅ Build for production
8. ✅ Deploy to hosting

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Output
- Build files in `dist/` folder
- Optimized and minified
- Ready for deployment

### Deploy to Netlify/Vercel
```bash
# Install CLI
npm install -g netlify-cli
# or
npm install -g vercel

# Deploy
netlify deploy --prod
# or
vercel --prod
```

### Deploy with Docker
```bash
docker build -t peraxis-customer-app .
docker run -p 3000:80 peraxis-customer-app
```

## 📞 Support

For issues:
1. Check documentation files
2. Review console errors
3. Check network tab for API issues
4. Verify environment variables
5. Test in incognito mode

## ✨ Features Checklist

- [x] Security fixes applied
- [x] Modern UI/UX implemented
- [x] Performance optimized
- [x] Responsive design
- [x] Dark mode support
- [x] Accessibility features
- [x] Error handling
- [x] Loading states
- [x] Animations
- [x] PWA ready

## 🎉 You're Ready!

The Peraxis Customer App is now ready for development and testing. Enjoy building! 🚀

---

**Version:** 2.0.0  
**Last Updated:** 2024  
**Status:** Production Ready ✅
