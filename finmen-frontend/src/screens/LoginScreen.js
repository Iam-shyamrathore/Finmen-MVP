import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
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
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [role, setRole] = useState('student');
  const [dataConsent, setDataConsent] = useState(false);
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
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

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

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setRole('student');
    setDataConsent(false);
    setError('');
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!password.trim()) {
      setError('Password is required');
      return false;
    }
    if (isSignUp) {
      if (!name.trim()) {
        setError('Name is required');
        return false;
      }
      if (!confirmPassword.trim()) {
        setError('Please confirm your password');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      if (!dataConsent) {
        setError('You must consent to data processing to continue');
        return false;
      }
    }
    return true;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    
    try {
      const endpoint = isSignUp ? 'register' : 'login';
      const payload = isSignUp 
        ? { name, email, password, role, dataConsent }
        : { email, password };

      const res = await axios.post(
        `https://finmen-mvp.onrender.com/api/auth/${endpoint}`,
        payload
      );
      
      const { token, user } = res.data;
      await AsyncStorage.setItem('jwtToken', token);
      await AsyncStorage.setItem('userName', user.name || name);
      navigation.replace('Home');
    } catch (err) {
      setError(err.response?.data?.msg || `${isSignUp ? 'Registration' : 'Login'} failed`);
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
        'https://finmen-mvp.onrender.com/api/auth/google',
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
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Hide when keyboard is visible on small screens */}
        {!keyboardVisible && (
          <View style={styles.header}>
            <Animatable.View animation="fadeInDown" duration={800} style={styles.headerContent}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>F</Text>
              </View>
              <Text style={styles.title}>FINMEN</Text>
              <Text style={styles.subtitle}>
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </Text>
            </Animatable.View>
          </View>
        )}

        {/* Toggle Component */}
        <Animatable.View animation="fadeInUp" duration={600} style={styles.toggleContainer}>
          <View style={styles.toggleWrapper}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                !isSignUp && styles.toggleButtonActive
              ]}
              onPress={() => !isSignUp || toggleAuthMode()}
            >
              <Text style={[
                styles.toggleButtonText,
                !isSignUp && styles.toggleButtonTextActive
              ]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                isSignUp && styles.toggleButtonActive
              ]}
              onPress={() => isSignUp || toggleAuthMode()}
            >
              <Text style={[
                styles.toggleButtonText,
                isSignUp && styles.toggleButtonTextActive
              ]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>

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
                  <Text style={styles.googleButtonText}>
                    Continue with Google
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Name Field - Only for Sign Up */}
            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={[styles.input, { borderColor: nameFocused ? '#000000' : '#E5E7EB' }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                />
              </View>
            )}

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

            {/* Confirm Password Field - Only for Sign Up */}
            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={[styles.input, { borderColor: confirmPasswordFocused ? '#000000' : '#E5E7EB' }]}
                  value={confirmPassword}
                  onChangeText={(text) => setConfirmPassword(text.trim())}
                  placeholder="Confirm your password"
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                />
              </View>
            )}

            {/* Role Selection - Only for Sign Up */}
            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>I am a</Text>
                <View style={styles.roleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      role === 'student' && styles.roleButtonActive
                    ]}
                    onPress={() => setRole('student')}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      role === 'student' && styles.roleButtonTextActive
                    ]}>
                      Student
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      role === 'educator' && styles.roleButtonActive
                    ]}
                    onPress={() => setRole('educator')}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      role === 'educator' && styles.roleButtonTextActive
                    ]}>
                      Educator
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Data Consent - Only for Sign Up */}
            {isSignUp && (
              <View style={styles.consentContainer}>
                <TouchableOpacity
                  style={styles.consentCheckbox}
                  onPress={() => setDataConsent(!dataConsent)}
                >
                  <View style={[
                    styles.checkbox,
                    dataConsent && styles.checkboxChecked
                  ]}>
                    {dataConsent && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.consentText}>
                    I consent to the processing of my personal data in accordance with the Digital Personal Data Protection Act, 2023
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            {!isSignUp && (
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
              </TouchableOpacity>
            )}
          </Animatable.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FAFAFA' 
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: { 
    paddingTop: 80, 
    paddingHorizontal: 32, 
    paddingBottom: 40, 
    alignItems: 'center' 
  },
  headerContent: { 
    alignItems: 'center' 
  },
  logo: {
    width: 60,
    height: 60,
    backgroundColor: '#000000',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: { 
    color: '#FFFFFF', 
    fontSize: 24, 
    fontWeight: '600', 
    letterSpacing: 1 
  },
  title: { 
    fontSize: 28, 
    fontWeight: '300', 
    color: '#000000', 
    letterSpacing: 2, 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#666666', 
    fontWeight: '400' 
  },
  toggleContainer: {
    paddingHorizontal: 32,
    marginBottom: 20,
  },
  toggleWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  toggleButtonTextActive: {
    color: '#000000',
  },
  form: { 
    flex: 1, 
    paddingHorizontal: 32 
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: { 
    color: '#DC2626', 
    fontSize: 14, 
    fontWeight: '500' 
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  googleButtonContent: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  googleIcon: { 
    color: '#4285F4', 
    fontSize: 18, 
    fontWeight: '600', 
    marginRight: 12 
  },
  googleButtonText: { 
    color: '#374151', 
    fontSize: 16, 
    fontWeight: '500' 
  },
  inputContainer: { 
    marginBottom: 20 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#374151', 
    marginBottom: 8, 
    marginLeft: 4 
  },
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
  buttonDisabled: { 
    opacity: 0.5 
  },
  buttonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '600', 
    letterSpacing: 0.5 
  },
  forgotPassword: { 
    alignItems: 'center', 
    marginBottom: 32 
  },
  forgotPasswordText: { 
    color: '#666666', 
    fontSize: 14, 
    fontWeight: '400' 
  },
  divider: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 24 
  },
  dividerLine: { 
    flex: 1, 
    height: 1, 
    backgroundColor: '#E5E7EB' 
  },
  dividerText: { 
    paddingHorizontal: 16, 
    color: '#9CA3AF', 
    fontSize: 14, 
    fontWeight: '400' 
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  roleButtonActive: {
    backgroundColor: '#000000',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  consentContainer: {
    marginBottom: 20,
  },
  consentCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  consentText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
});