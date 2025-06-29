import React, { useState, useEffect } from 'react';
import { useFonts } from 'expo-font';
import 'nativewind';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await AsyncStorage.clear();
      const token = await AsyncStorage.getItem('jwtToken');
      setIsAuthenticated(!!token); // Check if token exists
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  if (!fontsLoaded || isLoading) return null;

  return (
    <SafeAreaProvider>
      <AppNavigator isAuthenticated={isAuthenticated} />
    </SafeAreaProvider>
  );
}