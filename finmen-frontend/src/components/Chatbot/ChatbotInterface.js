import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  BackHandler,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Configuration
const CONFIG = {
  API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  MESSAGE_LIMIT: 100,
  MAX_INPUT_LENGTH: 1000,
  STORAGE_KEY: 'chatbot_messages',
  DEBOUNCE_DELAY: 300,
};

// Error types
const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  API: 'API_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  STORAGE: 'STORAGE_ERROR',
};

// Logging utility
const Logger = {
  error: (error, context, metadata = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: 'ERROR',
      context,
      message: error.message || error,
      stack: error.stack,
      metadata,
    };
    console.error(`[${timestamp}] [${context}]`, logEntry);
    
    // In production, send to crash reporting service
    // crashlytics().recordError(error);
  },
  
  info: (message, context, metadata = {}) => {
    const timestamp = new Date().toISOString();
    console.info(`[${timestamp}] [${context}]`, message, metadata);
  },
  
  warn: (message, context, metadata = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [${context}]`, message, metadata);
  },
};

// API Service
class ChatbotAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = CONFIG.API_BASE_URL;
  }

  async sendMessage(message, conversationHistory = []) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const contextualPrompt = this.buildContextualPrompt(message, conversationHistory);
      
      const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TherapistChatbot/1.0',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: contextualPrompt }],
          }],
          generation_config: {
            max_output_tokens: 200,
            temperature: 0.7,
            top_p: 0.9,
          },
          safety_settings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from API');
      }

      return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      
      throw error;
    }
  }

  buildContextualPrompt(message, history) {
    const recentHistory = history.slice(-6); // Last 6 messages for context
    let prompt = `You are a compassionate AI therapist using evidence-based therapeutic techniques including CBT, mindfulness, and active listening. 

Guidelines:
- Respond empathetically and validate emotions
- Ask thoughtful follow-up questions
- Suggest coping strategies when appropriate
- Never diagnose or prescribe medication
- Encourage professional help for serious concerns
- Keep responses under 200 words
- Maintain professional boundaries

`;

    if (recentHistory.length > 0) {
      prompt += 'Recent conversation:\n';
      recentHistory.forEach((msg, index) => {
        const role = msg.isUser ? 'User' : 'Therapist';
        prompt += `${role}: ${msg.text}\n`;
      });
    }

    prompt += `\nUser: ${message}\nTherapist:`;
    return prompt;
  }
}

// Message validation
const validateMessage = (text) => {
  if (!text || text.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }
  
  if (text.length > CONFIG.MAX_INPUT_LENGTH) {
    return { isValid: false, error: `Message too long (max ${CONFIG.MAX_INPUT_LENGTH} characters)` };
  }
  
  return { isValid: true };
};

// Storage utilities
const StorageUtils = {
  async saveMessages(messages) {
    try {
      await AsyncStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      Logger.error(error, 'Storage Save', { messagesCount: messages.length });
    }
  },

  async loadMessages() {
    try {
      const stored = await AsyncStorage.getItem(CONFIG.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      Logger.error(error, 'Storage Load');
      return [];
    }
  },

  async clearMessages() {
    try {
      await AsyncStorage.removeItem(CONFIG.STORAGE_KEY);
    } catch (error) {
      Logger.error(error, 'Storage Clear');
    }
  },
};

// Retry utility
const retryWithBackoff = async (fn, maxRetries = CONFIG.MAX_RETRIES) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = CONFIG.RETRY_DELAY * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Debounce utility
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

export default function ChatbotInterface() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [apiKey, setApiKey] = useState(''); // Should be loaded from secure storage
  const [error, setError] = useState(null);
  
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);
  const apiService = useRef(null);

  // Initialize API service
  useEffect(() => {
    // In production, load API key from secure storage
    const loadApiKey = async () => {
      try {
        // const key = await SecureStore.getItemAsync('gemini_api_key');
        const key = 'AIzaSyD4DzmDJxzxSWkoBucfBhgPGfPxlJmRDdY'; // Remove this hardcoded key
        setApiKey(key);
        apiService.current = new ChatbotAPI(key);
      } catch (error) {
        Logger.error(error, 'API Key Load');
        setError('Failed to initialize chat service');
      }
    };

    loadApiKey();
  }, []);

  // Load stored messages
  useEffect(() => {
    const loadStoredMessages = async () => {
      try {
        const storedMessages = await StorageUtils.loadMessages();
        if (storedMessages.length > 0) {
          setMessages(storedMessages);
        } else {
          setMessages([{
            id: Date.now(),
            text: "Hello! I'm your virtual therapist, here to listen and support you. How can I help you today?",
            isUser: false,
            timestamp: new Date().toISOString(),
          }]);
        }
      } catch (error) {
        Logger.error(error, 'Message Load');
      }
    };

    loadStoredMessages();
  }, []);

  // Network connectivity monitoring
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      if (!state.isConnected) {
        setError('No internet connection');
      } else {
        setError(null);
      }
    });

    return unsubscribe;
  }, []);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isLoading) {
        Alert.alert(
          'Cancel Request',
          'Are you sure you want to cancel the current request?',
          [
            { text: 'No', style: 'cancel' },
            { text: 'Yes', onPress: () => setIsLoading(false) },
          ]
        );
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isLoading]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Save messages when they change
  useEffect(() => {
    if (messages.length > 0) {
      StorageUtils.saveMessages(messages);
    }
  }, [messages]);

  const debouncedSend = useDebounce(async (messageText) => {
    if (!apiService.current) {
      setError('Chat service not initialized');
      setIsLoading(false);
      return;
    }

    if (!isConnected) {
      setError('No internet connection');
      setIsLoading(false);
      return;
    }

    try {
      const response = await retryWithBackoff(() => 
        apiService.current.sendMessage(messageText, messages)
      );

      const therapistMessage = {
        id: Date.now() + 1,
        text: response,
        isUser: false,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => {
        const newMessages = [...prev, therapistMessage];
        // Limit message history
        if (newMessages.length > CONFIG.MESSAGE_LIMIT) {
          return newMessages.slice(-CONFIG.MESSAGE_LIMIT);
        }
        return newMessages;
      });

      setError(null);
      Logger.info('Message sent successfully', 'Chat', { messageLength: messageText.length });
    } catch (error) {
      Logger.error(error, 'Message Send', { messageText });
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting right now. Please try again, or consider reaching out to a human therapist if you need immediate support.",
        isUser: false,
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setMessages(prev => [...prev, errorMessage]);
      setError('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, CONFIG.DEBOUNCE_DELAY);

  const handleSend = async () => {
    const messageText = inputText.trim();
    
    const validation = validateMessage(messageText);
    if (!validation.isValid) {
      Alert.alert('Invalid Message', validation.error);
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: messageText,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setError(null);

    // Blur input to dismiss keyboard
    inputRef.current?.blur();

    debouncedSend(messageText);
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setMessages([{
              id: Date.now(),
              text: "Chat cleared. How can I help you today?",
              isUser: false,
              timestamp: new Date().toISOString(),
            }]);
            await StorageUtils.clearMessages();
          },
        },
      ]
    );
  };

  const renderMessage = (message, index) => (
    <Animatable.View
      key={message.id || index}
      animation="fadeInUp"
      duration={400}
      delay={index * 50}
      style={[
        styles.messageBubble,
        {
          backgroundColor: message.isUser 
            ? '#10B981' 
            : message.isError 
              ? '#FEF2F2' 
              : '#F3F4F6',
          alignSelf: message.isUser ? 'flex-end' : 'flex-start',
          borderColor: message.isError ? '#FCA5A5' : 'transparent',
          borderWidth: message.isError ? 1 : 0,
        }
      ]}
    >
      <Text
        style={[
          styles.messageText,
          {
            color: message.isUser 
              ? '#FFFFFF' 
              : message.isError 
                ? '#DC2626' 
                : '#1F2937',
          }
        ]}
        accessibilityLabel={`${message.isUser ? 'You' : 'Therapist'} said: ${message.text}`}
      >
        {message.text}
      </Text>
      <Text style={[styles.timestamp, { color: message.isUser ? '#D1FAE5' : '#6B7280' }]}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </Animatable.View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Therapist Chat</Text>
        <TouchableOpacity onPress={handleClearChat} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map(renderMessage)}
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#10B981" />
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={[styles.input, { opacity: isLoading ? 0.6 : 1 }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor="#9CA3AF"
          editable={!isLoading}
          multiline
          maxLength={CONFIG.MAX_INPUT_LENGTH}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
          accessibilityLabel="Message input"
          accessibilityHint="Type your message to the therapist"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: isLoading || !inputText.trim() ? '#9CA3AF' : '#10B981',
              opacity: isLoading || !inputText.trim() ? 0.6 : 1,
            }
          ]}
          onPress={handleSend}
          disabled={isLoading || !inputText.trim()}
          accessibilityLabel="Send message"
          accessibilityHint="Send your message to the therapist"
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  clearButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  clearButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FCA5A5',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  chatContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 18,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    marginVertical: 4,
  },
  loadingText: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 44,
  },
  sendButton: {
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});