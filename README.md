# AeroPoints - Premium Award Flight Search Platform

🏆 **A sophisticated React-based web application for discovering and booking premium award flights with real-time data from Seats.aero API**

[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-cyan)](https://tailwindcss.com/)
[![NextUI](https://img.shields.io/badge/NextUI-2.x-black)](https://nextui.org/)

## 🌟 Features

### ✈️ **Advanced Flight Search**
- **Real-time Data Integration** with Seats.aero Partner API
- **Intelligent Airport Autocomplete** with city, country, and IATA code support
- **Flexible Date Selection** with enhanced DatePicker component
- **Multi-cabin Class Support** (Economy, Premium Economy, Business, First)
- **Loyalty Program Integration** for major airlines
- **Passenger Management** with adults, children, and infants

### 🎯 **Enhanced Sorting & Filtering**
- **4 Sorting Options**:
  - 🏆 Lowest Points
  - 🕐 Earliest Departure
  - ⏲️ Shortest Journey
  - ✈️ By Airline
- **Real-time Results** with instant sorting
- **Responsive Design** with mobile-optimized controls

### 🎨 **Premium UI/UX Design**
- **Luxury Design Language** with gold accents and premium styling
- **Glass Morphism Effects** with backdrop blur and transparency
- **Smooth Animations** powered by Framer Motion
- **Dark Theme** optimized for premium experience
- **Responsive Layout** that works seamlessly across all devices
- **Accessibility Features** with proper ARIA labels and keyboard navigation

### 🔒 **Security & Performance**
- **API Key Protection** - All sensitive keys stored server-side only
- **Environment Variable Management** with proper VITE_ prefixing
- **Proxy Architecture** - Frontend never directly calls external APIs
- **Error Handling** with graceful fallbacks and user feedback
- **Performance Optimization** with lazy loading and memoization

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Python** 3.8+ (for backend API)

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/Anujthakur650/AeroPoints.git
cd AeroPoints

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env

# Add your Seats.aero API key
echo "SEATS_AERO_API_KEY=your_api_key_here" >> .env

# Start backend server
python api_server.py
```

### Seats.aero API Setup

```bash
# Navigate to seats.aero API directory
cd seats_aero_api

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
echo "SEATS_AERO_API_KEY=your_api_key_here" > .env

# Start the API proxy server
python main.py
```

## 🏗️ Architecture

### Frontend Stack

- **React 18** with TypeScript for type safety
- **Vite** for lightning-fast development and building
- **TailwindCSS** for utility-first styling
- **NextUI** for premium component library
- **Framer Motion** for smooth animations
- **React Hook Form** for efficient form handling
- **Iconify** for comprehensive icon library

### Backend Stack

- **FastAPI** for high-performance API endpoints
- **Python** with async/await for concurrent processing
- **Seats.aero Partner API** for real-time flight data
- **Environment-based Configuration** for security

### Security Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │  Seats.aero     │
│   (React)       │────│   (FastAPI)     │────│     API         │
│                 │    │                 │    │                 │
│ No API Keys     │    │ API Keys Here   │    │ Partner API     │
│ Environment     │    │ Secure Proxy    │    │ Real-time Data  │
│ Variables Only  │    │ Error Handling  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎨 Recent UI/UX Enhancements

### ✅ **Search Form Improvements**
- **Perfect Alignment** - All form elements properly aligned
- **Dropdown Positioning** - Fixed overflow issues with proper boundaries
- **Spacing Consistency** - Uniform spacing throughout the form
- **Container Definition** - Clear visual hierarchy and boundaries
- **Responsive Design** - Optimized for all screen sizes
- **Accessibility** - Proper ARIA labels and keyboard navigation

### ✅ **Flight Results Sorting**
- **Enhanced Sorting Options** - 4 comprehensive sorting criteria
- **Visual Feedback** - Active sorting state clearly indicated
- **Performance Optimized** - Efficient sorting with memoization
- **Mobile Responsive** - Flex-wrap layout for smaller screens
## 🔧 Configuration

### Environment Variables

#### Frontend (.env.local)
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_ENVIRONMENT=development

# Google OAuth (Optional)
VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id
VITE_GOOGLE_OAUTH_REDIRECT_URI=http://localhost:5173/auth/google/callback

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_REPORTING=false
VITE_ENABLE_PREMIUM_FEATURES=true
```

#### Backend (.env)
```bash
# Seats.aero API
SEATS_AERO_API_KEY=your_seats_aero_api_key

# Server Configuration
PORT=8000
HOST=localhost
DEBUG=true

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
npx vercel

# Deploy to Netlify
npx netlify deploy --prod --dir=dist
```

### Backend Deployment (Railway/Heroku)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Environment Variables for Production

```bash
# Frontend
VITE_API_BASE_URL=https://your-backend-api.railway.app
VITE_ENVIRONMENT=production
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true

# Backend
SEATS_AERO_API_KEY=your_production_api_key
PORT=8000
HOST=0.0.0.0
DEBUG=false
```

## 🔒 Security

### Security Measures

- ✅ **No API Keys in Frontend** - All sensitive data server-side only
- ✅ **Environment Variable Protection** - Proper .env file handling
- ✅ **CORS Configuration** - Restricted origins for API access
- ✅ **Input Validation** - Comprehensive form validation
- ✅ **Error Handling** - Secure error messages without data leakage
- ✅ **HTTPS Enforcement** - SSL/TLS in production

### API Security

```python
# Seats.aero API Key Protection
SEATS_AERO_API_KEY = os.getenv("SEATS_AERO_API_KEY")
if not SEATS_AERO_API_KEY:
    raise ValueError("Missing SEATS_AERO_API_KEY environment variable")

# Secure headers
headers = {
    "Partner-Authorization": SEATS_AERO_API_KEY,
    "Accept": "application/json"
}
```

## 🧪 Testing

### Frontend Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Backend Testing

```bash
# Run Python tests
cd backend
python -m pytest

# Test API endpoints
python test_api.py

# Test Seats.aero integration
cd seats_aero_api
python test_client.py
```

## 🐛 Troubleshooting

### Common Issues

#### Frontend Issues

**Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npm run dev -- --force
```

**Environment Variables Not Loading**
```bash
# Ensure .env.local exists and has VITE_ prefix
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local
```

#### Backend Issues

**API Key Errors**
```bash
# Verify environment variable is set
echo $SEATS_AERO_API_KEY

# Check .env file exists
cat .env
```

**CORS Errors**
```python
# Update CORS settings in api_server.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper TypeScript types
4. **Add tests** for new functionality
5. **Run the test suite**: `npm run test`
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to the branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Code Standards

- **TypeScript** for all new code
- **ESLint + Prettier** for code formatting
- **Conventional Commits** for commit messages
- **Component Documentation** with JSDoc comments
- **Test Coverage** minimum 80%

## 📈 Roadmap

### Upcoming Features

- 🔄 **Real-time Price Alerts** - Notify users of price changes
- 📱 **Mobile App** - React Native implementation
- 🤖 **AI-Powered Recommendations** - Smart flight suggestions
- 📊 **Analytics Dashboard** - User search patterns and insights
- 🔐 **User Authentication** - Save searches and preferences
- 💳 **Direct Booking Integration** - Seamless booking experience

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Seats.aero** for providing comprehensive flight data API
- **NextUI Team** for the beautiful component library
- **Vercel** for excellent deployment platform
- **React Community** for continuous innovation

## 📞 Support

For support, email support@aeropoints.com or join our [Discord community](https://discord.gg/aeropoints).

---

**Built with ❤️ by the AeroPoints Team**






