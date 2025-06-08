# Startup Ecosystem Mobile App

A comprehensive React Native mobile application for the Malaysian startup ecosystem platform, providing AI-powered matching, intelligent discovery, and seamless networking capabilities.

## Features

### Core Functionality
- **Multi-Role Authentication**: Founders, Funders, and Ecosystem Builders
- **AI-Powered Discovery**: Intelligent startup and opportunity matching
- **Real-time Search**: Advanced filtering and recommendation engine
- **Application Management**: Track funding applications and opportunities
- **Profile Management**: Complete onboarding and profile customization
- **Networking Tools**: Connect with ecosystem participants

### Role-Specific Features
- **Founders**: Discover funding opportunities, submit applications, showcase startups
- **Funders**: Find investment opportunities, review applications, track portfolio
- **Ecosystem Builders**: Access comprehensive ecosystem insights and analytics

## Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **State Management**: React Query + Context API
- **UI Components**: React Native Paper (Material Design)
- **Authentication**: Secure token-based authentication with Expo SecureStore
- **Backend Integration**: RESTful API with n8n workflow support

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

### Installation

1. **Navigate to mobile directory**
   ```bash
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create `.env` file in the mobile directory:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   - iOS: Press `i` in the terminal or scan QR code with Expo Go
   - Android: Press `a` in the terminal or scan QR code with Expo Go
   - Web: Press `w` in the terminal

### Test Credentials
```
Founder: founder@test.com / password123
Funder: funder@test.com / password123
Admin: admin@test.com / password123
```

## Project Structure

```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   ├── navigation/          # Navigation configuration
│   ├── screens/            # Screen components
│   │   ├── auth/           # Authentication screens
│   │   └── main/           # Main application screens
│   ├── services/           # API and authentication services
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions and theme
├── App.tsx                 # Root application component
├── app.json               # Expo configuration
└── package.json           # Dependencies and scripts
```

## Development Guidelines

### Adding New Features
1. Create feature branch: `git checkout -b feature/feature-name`
2. Implement feature with proper TypeScript types
3. Add error handling and loading states
4. Test on both iOS and Android
5. Update documentation as needed

### Code Style
- Use TypeScript for all new code
- Follow React Native best practices
- Implement proper error boundaries
- Use React Query for data fetching
- Follow Material Design principles

### Testing
- Test on multiple device sizes
- Verify authentication flows
- Test offline behavior
- Validate form inputs
- Check accessibility features

## API Integration

The mobile app integrates with the existing backend API and supports n8n workflow integration:

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `PUT /api/profile` - Update user profile

### Core Endpoints
- `GET /api/search` - Search startups and opportunities
- `GET /api/opportunities` - Get funding opportunities
- `GET /api/startups` - Get startup listings
- `POST /api/applications` - Submit applications

### N8N Workflow Support
The app includes built-in support for n8n backend workflows:
- Configurable webhook endpoints
- Automated data processing
- Real-time notifications
- Advanced analytics integration

## Building for Production

### iOS App Store
```bash
eas build --platform ios
```

### Google Play Store
```bash
eas build --platform android
```

### Configuration
Update `app.json` with production settings:
- App name and bundle identifier
- Icons and splash screens
- Permissions and capabilities
- Store-specific metadata

## Deployment

### Expo Application Services (EAS)
1. Install EAS CLI: `npm install -g eas-cli`
2. Configure project: `eas build:configure`
3. Build for production: `eas build --platform all`
4. Submit to stores: `eas submit`

### Manual Deployment
1. Build production bundles
2. Generate signed APK/IPA files
3. Upload to respective app stores
4. Configure store listings and metadata

## Performance Optimization

- Lazy loading for screens
- Image optimization and caching
- API response caching with React Query
- Bundle size optimization
- Memory leak prevention

## Security Features

- Secure token storage with Expo SecureStore
- API request authentication
- Input validation and sanitization
- Secure communication with HTTPS
- User session management

## Troubleshooting

### Common Issues
1. **Metro bundler errors**: Clear cache with `expo start --clear`
2. **Dependency conflicts**: Delete `node_modules` and reinstall
3. **iOS simulator issues**: Reset simulator and rebuild
4. **Android build failures**: Check Android SDK configuration

### Debug Tools
- React Native Debugger
- Flipper integration
- Expo development tools
- Native debugging with Xcode/Android Studio

## Contributing

1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Submit pull request with description
5. Ensure CI/CD pipeline passes

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

For technical support and questions:
- Documentation: See inline code comments
- Issues: Create GitHub issue with reproduction steps
- Community: Join developer discussions