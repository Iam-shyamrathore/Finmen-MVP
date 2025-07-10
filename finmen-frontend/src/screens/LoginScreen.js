import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Animatable from 'react-native-animatable';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const navigation = useNavigation();

  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:
      '1066040103136-loq23p1jt1ie0tj2fke12aqndillqfj6.apps.googleusercontent.com',
    androidClientId:
      '1066040103136-ntia8e0smsuplhoq95fv81ep8jv28ao8.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    redirectUri,
    responseType: AuthSession.ResponseType.IdToken,
    additionalParameters: { prompt: 'select_account' },
  });

  useEffect(() => {
    if (googleLoading) {
      if (response?.type === 'success') {
        const { authentication } = response;
        if (authentication?.idToken) {
          handleGoogleResponse(authentication.idToken);
        } else {
          setError('Google Auth Error: Could not retrieve ID token.');
          setGoogleLoading(false);
        }
      } else if (response?.type === 'error') {
        setError(
          `Google Auth Error: ${
            response.error?.message || 'Authentication failed or cancelled'
          }`
        );
        setGoogleLoading(false);
      } else if (
        response?.type === 'cancel' ||
        response?.type === 'dismiss'
      ) {
        setError('Google sign in was cancelled.');
        setGoogleLoading(false);
      }
    }
  }, [response, googleLoading]);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        'http://192.168.0.106:5000/api/auth/login',
        { email, password }
      );
      const { token, user } = res.data;
      await AsyncStorage.setItem('jwtToken', token);
      await AsyncStorage.setItem('userName', user.name);
      navigation.replace('Home');
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleResponse = async (idToken) => {
    if (!idToken) {
      setError('No ID token received from Google');
      setGoogleLoading(false);
      return;
    }

    setError('');

    try {
      const res = await axios.post(
        'http://192.168.0.106:5000/api/auth/google',
        { idToken }
      );
      const { token, userName } = res.data;
      await AsyncStorage.setItem('jwtToken', token);
      await AsyncStorage.setItem('userName', userName);
      navigation.replace('Home');
    } catch (err) {
      setError(err.response?.data?.msg || 'Google sign in failed on server');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await promptAsync();
    } catch (err) {
      setError('Failed to initiate Google sign in.');
      console.error('Google sign in error:', err);
      setGoogleLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animatable.View animation="fadeInDown" duration={800} style={styles.headerContent}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>F</Text>
          </View>
          <Text style={styles.title}>FINMEN</Text>
          <Text style={styles.subtitle}>Welcome back</Text>
        </Animatable.View>
      </View>

      <View style={styles.form}>
        {error ? (
          <Animatable.View animation="fadeIn" style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </Animatable.View>
        ) : null}

        <Animatable.View animation="fadeInUp" duration={600} delay={200}>
          <TouchableOpacity
            style={[styles.googleButton, (googleLoading || !request) && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={googleLoading || !request}
          >
            {googleLoading ? (
              <ActivityIndicator color="#4285F4" size="small" />
            ) : (
              <View style={styles.googleButtonContent}>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, { borderColor: emailFocused ? '#000000' : '#E5E7EB' }]}
              value={email}
              onChangeText={(text) => setEmail(text.trim())}
              placeholder="Enter your email"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, { borderColor: passwordFocused ? '#000000' : '#E5E7EB' }]}
              value={password}
              onChangeText={(text) => setPassword(text.trim())}
              placeholder="Enter your password"
              secureTextEntry
              placeholderTextColor="#9CA3AF"
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.signupText}>Create Account</Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingTop: 80, paddingHorizontal: 32, paddingBottom: 60, alignItems: 'center' },
  headerContent: { alignItems: 'center' },
  logo: {
    width: 60,
    height: 60,
    backgroundColor: '#000000',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: { color: '#FFFFFF', fontSize: 24, fontWeight: '600', letterSpacing: 1 },
  title: { fontSize: 28, fontWeight: '300', color: '#000000', letterSpacing: 2, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666666', fontWeight: '400' },
  form: { flex: 1, paddingHorizontal: 32 },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: { color: '#DC2626', fontSize: 14, fontWeight: '500' },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  googleButtonContent: { flexDirection: 'row', alignItems: 'center' },
  googleIcon: { color: '#4285F4', fontSize: 18, fontWeight: '600', marginRight: 12 },
  googleButtonText: { color: '#374151', fontSize: 16, fontWeight: '500' },
  inputContainer: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8, marginLeft: 4 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
    fontWeight: '400',
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    opacity: 1,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
  forgotPassword: { alignItems: 'center', marginBottom: 32 },
  forgotPasswordText: { color: '#666666', fontSize: 14, fontWeight: '400' },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { paddingHorizontal: 16, color: '#9CA3AF', fontSize: 14, fontWeight: '400' },
  signupButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signupText: { color: '#374151', fontSize: 16, fontWeight: '500' },
});
