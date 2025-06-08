# Mobile App Deployment Guide

## Overview
This guide covers the complete deployment process for the Malaysian Startup Ecosystem mobile application, from development setup to production app store releases.

## Prerequisites

### Development Environment
- Node.js 18 or higher
- Expo CLI: `npm install -g @expo/cli`
- EAS CLI: `npm install -g eas-cli`
- Xcode (for iOS deployment)
- Android Studio (for Android deployment)

### Accounts Required
- Expo Account (free)
- Apple Developer Account ($99/year for iOS)
- Google Play Console Account ($25 one-time for Android)

## Initial Setup

### 1. Environment Configuration
Create `.env` file in the mobile directory:
```env
EXPO_PUBLIC_API_URL=https://your-production-api.com
```

### 2. App Configuration
Update `app.json` with production settings:
```json
{
  "expo": {
    "name": "Malaysian Startup Ecosystem",
    "slug": "malaysian-startup-ecosystem",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#007AFF"
    },
    "platforms": ["ios", "android"],
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.startupecosystem",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#007AFF"
      },
      "package": "com.yourcompany.startupecosystem",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

## Development Deployment

### Local Testing
```bash
cd mobile
npm install
npm start
```

### Testing on Physical Devices
1. Install Expo Go app on your device
2. Scan QR code from terminal
3. Test authentication flow with test credentials:
   - Founder: founder@test.com / password123
   - Funder: funder@test.com / password123
   - Admin: admin@test.com / password123

## Production Deployment

### 1. EAS Setup
```bash
# Initialize EAS
eas login
eas build:configure

# Configure build profiles
eas credentials
```

### 2. Build Configuration
Create `eas.json`:
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m1-medium"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m1-medium"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m1-medium"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 3. iOS Deployment

#### App Store Connect Setup
1. Create app record in App Store Connect
2. Configure app information:
   - Name: "Malaysian Startup Ecosystem"
   - Bundle ID: com.yourcompany.startupecosystem
   - Categories: Business, Networking
   - Content rating: 4+

#### Build and Submit
```bash
# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

#### App Store Assets
- App Icon: 1024x1024px
- Screenshots: Various device sizes
- App Preview: Optional video demonstration
- Description: Focus on startup ecosystem, AI matching, networking

#### App Store Metadata
```
Title: Malaysian Startup Ecosystem
Subtitle: Connect. Discover. Grow.

Description:
Join Malaysia's premier startup ecosystem platform. Connect with founders, funders, and ecosystem builders. Discover funding opportunities, showcase your startup, and leverage AI-powered matching to accelerate your growth.

Features:
• AI-powered startup and funder matching
• Comprehensive opportunity discovery
• Real-time ecosystem insights
• Multi-role authentication (Founders, Funders, Builders)
• Advanced search and filtering
• Application management system
• Malaysian market focus

Keywords: startup, funding, entrepreneur, venture capital, Malaysia, ecosystem, networking, business
```

### 4. Android Deployment

#### Google Play Console Setup
1. Create app in Google Play Console
2. Configure app details:
   - App name: "Malaysian Startup Ecosystem"
   - Package name: com.yourcompany.startupecosystem
   - Category: Business
   - Content rating: Everyone

#### Build and Submit
```bash
# Build for Android
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

#### Play Store Assets
- App Icon: 512x512px
- Feature Graphic: 1024x500px
- Screenshots: Phone and tablet sizes
- Short Description: Connect with Malaysia's startup ecosystem
- Full Description: Same as iOS with Google Play formatting

## Security Configuration

### API Security
- HTTPS only for production API
- Token-based authentication
- Secure storage for sensitive data
- API rate limiting

### App Security
- Certificate pinning for API requests
- Secure keychain storage
- Input validation and sanitization
- No sensitive data in logs

## Performance Optimization

### Bundle Size
```bash
# Analyze bundle size
npx expo-doctor

# Remove unused dependencies
npm prune
```

### Runtime Performance
- Image optimization and lazy loading
- API response caching
- Memory leak prevention
- Smooth navigation transitions

## Testing Strategy

### Automated Testing
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react-native

# Run tests
npm test
```

### Manual Testing Checklist
- [ ] Authentication flow (login/register)
- [ ] Role-based navigation
- [ ] Search functionality
- [ ] Opportunity discovery
- [ ] Application submission
- [ ] Profile management
- [ ] Offline behavior
- [ ] Push notifications (if implemented)

### Device Testing
- Test on multiple iOS versions (iOS 13+)
- Test on multiple Android versions (Android 8+)
- Test on various screen sizes
- Test with poor network conditions

## Release Process

### Version Management
```bash
# Update version numbers
# In app.json: increment version and buildNumber/versionCode

# Tag release
git tag v1.0.0
git push origin v1.0.0
```

### Release Notes Template
```
Version 1.0.0
🎉 Initial Release

✨ New Features:
• AI-powered startup and funder matching
• Comprehensive opportunity discovery
• Role-based authentication and navigation
• Malaysian startup ecosystem focus

🔧 Technical:
• Secure authentication with token storage
• Real-time data synchronization
• Offline-first architecture
• Material Design UI components

🇲🇾 Malaysia-Specific:
• Localized content and opportunities
• Focus on Malaysian market sectors
• Support for local startup stages and funding
```

## Monitoring and Analytics

### Crash Reporting
```bash
# Install Sentry for crash reporting
npm install @sentry/react-native
```

### Analytics Setup
- User acquisition tracking
- Feature usage analytics
- Conversion funnel analysis
- Performance monitoring

### Health Checks
- API response time monitoring
- App startup performance
- Memory usage tracking
- User session analytics

## Maintenance

### Regular Updates
- Security patches monthly
- Feature updates quarterly
- OS compatibility updates as needed
- Dependencies updates every 6 months

### Support Process
- In-app feedback mechanism
- User support email
- FAQ and help documentation
- Community forums or support channels

## Rollback Strategy

### Emergency Rollback
1. Remove problematic version from stores
2. Revert to previous stable version
3. Communicate with users via in-app notifications
4. Fix issues and re-deploy

### Gradual Rollout
- Start with 10% user base
- Monitor crash rates and feedback
- Gradually increase to 100%
- Pause rollout if issues detected

## Cost Estimation

### Development Costs
- Apple Developer Account: $99/year
- Google Play Console: $25 one-time
- EAS Build: $29/month (optional, can use free tier)
- App Store optimization tools: $50-200/month

### Operational Costs
- Push notifications service
- Analytics and monitoring tools
- Customer support tools
- Marketing and user acquisition

## Success Metrics

### Key Performance Indicators
- Downloads and installations
- User registration and activation rates
- Daily/Monthly Active Users (DAU/MAU)
- User retention rates
- Feature adoption rates
- App store ratings and reviews

### Business Metrics
- Startup-funder connections made
- Successful funding applications
- User engagement with opportunities
- Time spent in app per session

This deployment guide ensures a professional, secure, and scalable mobile app deployment for the Malaysian startup ecosystem platform.