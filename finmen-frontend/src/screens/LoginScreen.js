import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Animatable from 'react-native-animatable';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://192.168.0.109:5000/api/auth/login', { email, password });
      const { token } = response.data;
      await AsyncStorage.setItem('jwtToken', token);
      navigation.replace('Home');
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Animatable.View animation="fadeInDown" duration={800} style={styles.headerContent}>
          {/* Minimalist Logo */}
          <View style={styles.logo}>
            <Text style={styles.logoText}>F</Text>
          </View>
          <Text style={styles.title}>FINMEN</Text>
          <Text style={styles.subtitle}>Welcome back</Text>
        </Animatable.View>
      </View>

      {/* Form Section */}
      <View style={styles.form}>
        {/* Error Message */}
        {error ? (
          <Animatable.View animation="fadeIn" style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </Animatable.View>
        ) : null}

        <Animatable.View animation="fadeInUp" duration={600} delay={200}>
          {/* Email Input */}
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

          {/* Password Input */}
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

          {/* Login Button */}
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

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Signup Link */}
          <TouchableOpacity style={styles.signupButton} onPress={() => navigation.navigate('Signup')}>
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
    marginBottom: 24 
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
  form: { flex: 1, paddingHorizontal: 32 },
  errorContainer: { 
    backgroundColor: '#FEF2F2', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 24, 
    borderLeftWidth: 4, 
    borderLeftColor: '#EF4444' 
  },
  errorText: { 
    color: '#DC2626', 
    fontSize: 14, 
    fontWeight: '500' 
  },
  inputContainer: { marginBottom: 24 },
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
    fontWeight: '400' 
  },
  button: { 
    backgroundColor: '#000000', 
    borderRadius: 12, 
    paddingVertical: 16, 
    alignItems: 'center', 
    marginBottom: 24, 
    opacity: 0.7 
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '600', 
    letterSpacing: 0.5 
  },
  forgotPassword: { alignItems: 'center', marginBottom: 32 },
  forgotPasswordText: { 
    color: '#666666', 
    fontSize: 14, 
    fontWeight: '400' 
  },
  divider: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 32 
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
  signupButton: { 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 12, 
    paddingVertical: 16, 
    alignItems: 'center' 
  },
  signupText: { 
    color: '#374151', 
    fontSize: 16, 
    fontWeight: '500' 
  },
});