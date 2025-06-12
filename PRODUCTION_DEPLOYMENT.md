# AeroPoints Production Deployment Guide

## 🚀 Production Readiness Checklist

This guide covers the complete deployment process for AeroPoints to production environments.

## 🔒 Security Configuration

### 1. Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# Frontend Environment Variables
VITE_API_BASE_URL=https://api.aeropoints.com
VITE_GOOGLE_OAUTH_CLIENT_ID=your_production_google_client_id
VITE_GOOGLE_OAUTH_REDIRECT_URI=https://aeropoints.com/auth/google/callback
```

### 2. Backend Security

Ensure these backend environment variables are set:

```bash
# Required for production
JWT_SECRET_KEY=your_super_secure_jwt_secret_256_bits_minimum
DATABASE_URL=postgresql://user:password@localhost:5432/aeropoints_prod
GOOGLE_OAUTH_CLIENT_SECRET=your_google_oauth_client_secret
SEATS_AERO_API_KEY=your_seats_aero_pro_api_key

# CORS Configuration
ALLOWED_ORIGINS=["https://aeropoints.com","https://www.aeropoints.com"]

# Optional but recommended
SENTRY_DSN=your_sentry_dsn_for_error_tracking
REDIS_URL=redis://localhost:6379  # For caching
```

## 🏗️ Build Process

### 1. Frontend Build

```bash
# Install dependencies
npm ci

# Build for production
npm run build

# Preview production build (optional)
npm run preview
```

### 2. Build Optimization

The production build includes:
- Code splitting and minification
- CSS optimization with PostCSS
- Asset optimization and compression
- Service worker for offline functionality (if configured)

## 🌐 Deployment Options

### Option 1: Static Hosting (Recommended)

**Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Netlify**
```bash
# Build command: npm run build
# Publish directory: dist
# Environment variables: Set in Netlify dashboard
```

**AWS S3 + CloudFront**
```bash
# Build and sync to S3
npm run build
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Option 2: Docker Deployment

Create `Dockerfile`:
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔧 Infrastructure Setup

### 1. Database Setup (Backend)

```sql
-- Create production database
CREATE DATABASE aeropoints_prod;
CREATE USER aeropoints_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE aeropoints_prod TO aeropoints_user;
```

### 2. Redis Setup (Optional - for caching)

```bash
# Install Redis
sudo apt-get install redis-server

# Configure Redis for production
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### 3. Nginx Configuration

```nginx
server {
    listen 80;
    server_name aeropoints.com www.aeropoints.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name aeropoints.com www.aeropoints.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend
    location / {
        root /var/www/aeropoints/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 Monitoring & Analytics

### 1. Error Tracking

The application includes built-in error tracking that sends errors to your backend. For production, consider integrating:

- **Sentry**: For error tracking and performance monitoring
- **LogRocket**: For session replay and debugging
- **DataDog**: For comprehensive monitoring

### 2. Performance Monitoring

```javascript
// Add to your index.html for production
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### 3. Google Analytics (Optional)

Add to `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🔐 SSL/TLS Setup

### 1. Let's Encrypt (Free SSL)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d aeropoints.com -d www.aeropoints.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🚦 Health Checks & Monitoring

### 1. Backend Health Check

Ensure your backend has a health endpoint:
```
GET /health
Response: {"status": "healthy", "timestamp": "2025-01-01T00:00:00Z"}
```

### 2. Frontend Health Check

The application includes automatic API connection checking.

### 3. Uptime Monitoring

Set up monitoring for:
- Frontend: `https://aeropoints.com`
- Backend API: `https://api.aeropoints.com/health`
- Database connectivity
- External API dependencies (Seats.aero, Google OAuth)

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
          VITE_GOOGLE_OAUTH_CLIENT_ID: ${{ secrets.VITE_GOOGLE_OAUTH_CLIENT_ID }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🔧 Performance Optimization

### 1. Bundle Analysis

```bash
# Analyze bundle size
npm run build -- --analyze
```

### 2. Code Splitting

The application already includes:
- Route-based code splitting
- Component lazy loading
- Dynamic imports for heavy components

### 3. Caching Strategy

- Static assets: 1 year cache
- API responses: Implement caching based on data freshness
- Service worker: Cache shell and API responses

## 🛡️ Security Best Practices

### 1. Content Security Policy

Add to your server or meta tag:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://accounts.google.com;
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src 'self' https://fonts.gstatic.com;
               img-src 'self' data: https:;
               connect-src 'self' https://api.aeropoints.com;">
```

### 2. Environment Security

- Never commit `.env` files
- Use secrets management in production
- Rotate API keys regularly
- Implement rate limiting on backend

## 📋 Production Checklist

Before going live, verify:

- [ ] All environment variables are set correctly
- [ ] SSL certificate is installed and working
- [ ] Google OAuth is configured for production domain
- [ ] Database is backed up and secured
- [ ] Error tracking is configured
- [ ] Monitoring and alerts are set up
- [ ] Performance benchmarks are established
- [ ] Security headers are implemented
- [ ] CORS is properly configured
- [ ] API rate limiting is in place
- [ ] Backup and disaster recovery plan is ready

## 🔍 Troubleshooting

### Common Issues

1. **Google OAuth not working**: Check redirect URI matches exactly
2. **API connection fails**: Verify CORS and SSL configuration
3. **Build fails**: Check environment variables and dependencies
4. **Slow loading**: Enable compression and optimize assets

### Debug Mode

For production debugging, set:
```bash
VITE_DEBUG_MODE=true  # Only in staging, never in production
```

## 📞 Support

For deployment issues:
1. Check the application logs
2. Verify all environment variables
3. Test API endpoints individually
4. Review security configurations

Remember to never expose sensitive information in production builds! 