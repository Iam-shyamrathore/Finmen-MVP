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

2. **Set Up Backend**
   ```bash
   cd finmen-backend
   npm install
   ```
   - Configure MongoDB connection in the backend (create `.env` file with `MONGO_URI`)
   - Start the backend server:
   ```bash
   npm start
   ```
   - Backend will run on `http://192.168.0.109:5000` (or your local IP)

3. **Set Up Frontend**
   ```bash
   cd ../finmen-frontend
   npm install
   ```

4. **Start the Expo App**
   ```bash
   npx expo start --clear
   ```
   - Use the Expo Go app on your device to view the app
   - Ensure your device is on the same network as your development machine

## Configuration

- **API Endpoint**: The backend runs on `http://192.168.0.109:5000` (your local IP address)
  - **Important**: This IP address is configured for Expo Go connectivity. Both your development machine and mobile device must be on the same network
  - Keep this IP address unchanged until the project is ready for production deployment
  - If you need to change the IP, update it in the frontend API calls (e.g., `LoginScreen.js`)
- **Environment Variables**: Create a `.env` file in the `finmen-backend` directory with:
  ```
  MONGO_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret_key
  PORT=5000
  ```

## Project Structure

```
finmen-mvp/
├── finmen-backend/       # Backend server (Node.js, Express, MongoDB)
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Authentication & validation middleware
│   ├── config/           # Database configuration
│   ├── server.js         # Backend entry point
│   └── package.json      # Backend dependencies
├── finmen-frontend/      # Frontend app (React Native, Expo)
│   ├── src/
│   │   ├── screens/      # React components (LoginScreen, HomeScreen, MissionList, MoodTracker)
│   │   ├── navigation/   # Navigation setup (AppNavigator)
│   │   └── services/     # API service files
│   ├── App.js            # Frontend entry point
│   └── package.json      # Frontend dependencies
├── .gitignore            # Git ignore rules
└── README.md             # This file
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
- Navigate to the appropriate directory:
  - Frontend changes: `cd finmen-frontend`
  - Backend changes: `cd finmen-backend`
- Implement your features or fixes
- Test locally:
  - Frontend: `npx expo start --clear` (from finmen-frontend directory)
  - Backend: `npm start` (from finmen-backend directory)

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
   - Verify the backend server is running on `http://192.168.0.109:5000`
   - Ensure both your development machine and mobile device are on the same WiFi network
   - Check that the IP address matches your machine's local IP
   - Verify MongoDB connection is established (check console logs)
   - Test API endpoints using tools like Postman or curl

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