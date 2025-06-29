# FINMEN MVP

Welcome to the FINMEN MVP (Minimum Viable Product), a financial wellness app designed to help users track missions and moods with a MongoDB backend. This repository contains the frontend built with React Native and Expo, integrated with a Node.js/Express backend for authentication and data management.

## Project Overview

- **Purpose**: FINMEN aims to provide a user-friendly platform for managing financial missions and tracking mood to promote healthy money habits.
- **Tech Stack**:
  - Frontend: React Native, Expo, Axios, AsyncStorage
  - Backend: Node.js, Express, MongoDB, JWT Authentication
  - Navigation: React Navigation
  - Styling: NativeWind (Tailwind CSS for React Native)
- **Current Features**:
  - Login screen with MongoDB authentication
  - Home screen (placeholder)
  - Mission list with progress tracking
  - Mood tracker with history
- **Target Platform**: iOS and Android (via Expo Go or EAS Build)

## Getting Started

### Prerequisites
- Node.js (v16 or later)
- Expo CLI (`npm install -g expo-cli`)
- MongoDB (local or remote instance)
- Backend server running on `http://192.168.0.109:5000` (adjust as needed)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/finmen-mvp.git
   cd finmen-mvp
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Backend**
   - Ensure the backend server is running on `http://192.168.0.109:5000`
   - Configure MongoDB connection in the backend (e.g., `.env` file with `MONGO_URI`)
   - Start the backend server:
   ```bash
   cd ../backend  # Adjust path to backend directory
   npm start
   ```

4. **Start the App**
   - Run the Expo development server:
   ```bash
   npx expo start --clear
   ```
   - Use the Expo Go app on your device or a browser to view the app

## Configuration

- **API Endpoint**: Update the base URL in `LoginScreen.js` (`http://192.168.0.109:5000/api/auth/login`) if your backend IP or port changes
- **Environment Variables**: If using a `.env` file for secrets (e.g., JWT secret), ensure it's set up in the backend

## Project Structure

```
finmen-mvp/
├── src/
│   ├── screens/          # React components (LoginScreen, HomeScreen, MissionList, MoodTracker)
│   ├── navigation/       # Navigation setup (AppNavigator)
│   └── services/         # API service files (if any)
├── App.js                # Main app entry point
├── README.md             # This file
└── package.json          # Project dependencies
```

## Usage

- **Login**: Use the login screen with credentials registered in the MongoDB backend
- **Navigation**: Successfully logged-in users navigate to the Home screen
- **Missions and Mood**: Explore mission lists and mood tracking features

## Contributing

### Fork the Repository
Create your own fork of the repo on GitHub.

### Create a Branch
Use a descriptive branch name (e.g., `feature/mission-tracking`):
```bash
git checkout -b feature/mission-tracking
```

### Make Changes
- Implement your features or fixes
- Test locally with `npx expo start --clear`

### Commit Changes
Stage and commit your changes:
```bash
git add .
git commit -m "Add mission tracking feature"
```

### Push to GitHub
Push your branch:
```bash
git push origin feature/mission-tracking
```

### Create a Pull Request (PR)
- Open a PR from your branch to the main branch
- Request a review from teammates

### Code Review
Address feedback and merge after approval.

## Development Guidelines

- **Code Style**: Follow the existing React Native conventions (e.g., functional components, hooks)
- **Testing**: Test on both iOS and Android emulators/devices
- **Commits**: Write clear, concise commit messages
- **Dependencies**: Add new dependencies via `npm install <package> --save` and update `package.json`

## Troubleshooting

### Common Issues

1. **Backend Connection Issues**
   - Verify the backend server is running on the correct IP and port
   - Check network connectivity between frontend and backend
   - Ensure MongoDB connection is established

2. **Expo Development Issues**
   - Clear Expo cache: `npx expo start --clear`
   - Restart the development server
   - Check for port conflicts

3. **Authentication Problems**
   - Verify JWT token handling in both frontend and backend
   - Check AsyncStorage for token persistence
   - Ensure proper error handling for authentication failures

## Team Collaboration

### Branch Management
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Individual feature branches
- `hotfix/*`: Critical bug fixes

### Code Review Process
1. Create feature branch from `develop`
2. Implement changes with proper testing
3. Submit PR with clear description
4. Request review from at least one team member
5. Address feedback and merge after approval

### Communication
- Use descriptive commit messages
- Update documentation for new features
- Communicate breaking changes to the team
- Tag team members in relevant PRs

## Deployment

### Development Build
```bash
npx expo build:android
npx expo build:ios
```

### Production Build
```bash
npx expo build:android --release-channel production
npx expo build:ios --release-channel production
```

## Support

For questions or issues:
1. Check this README first
2. Review existing GitHub issues
3. Create a new issue with detailed description
4. Contact team members via project communication channels

## License

This project is proprietary to the FINMEN development team. All rights reserved.