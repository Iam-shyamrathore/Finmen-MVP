import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';

const logError = (error, context) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [Error] ${context}:`, error.message || error);
};

export default function ChatbotInterface() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMessages([{ text: "Hello! I'm your virtual therapist, here to listen and support you. How can I help you today?", isUser: false }]);
  }, []);

  const handleSend = async () => {
    if (inputText.trim()) {
      const userMessage = { text: inputText, isUser: true };
      setMessages((prev) => [...prev, userMessage]);
      setInputText('');
      setIsLoading(true);

      try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyD4DzmDJxzxSWkoBucfBhgPGfPxlJmRDdY', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `User: ${inputText}\nTherapist: You are a compassionate therapist using Cognitive Behavioral Therapy techniques. Respond empathetically, avoid diagnosing, and suggest professional help if crisis is mentioned.` }],
            }],
            generation_config: {
              max_output_tokens: 150,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
          throw new Error('Invalid response format from Gemini API');
        }
        const therapistResponse = data.candidates[0].content.parts[0].text.trim();
        setMessages((prev) => [...prev, { text: therapistResponse, isUser: false }]);
      } catch (error) {
        logError(error, 'Chatbot API Request');
        setMessages((prev) => [...prev, { text: "Sorry, I couldn't connect to the therapist AI. Please try again later or seek professional help.", isUser: false }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} accessibilityRole="header">Therapist Chat</Text>
      </View>
      <ScrollView style={styles.chatContainer}>
        {messages.map((message, index) => (
          <Animatable.View
            key={index}
            animation="fadeIn"
            duration={500}
            style={[styles.messageBubble, { backgroundColor: message.isUser ? '#10B981' : '#E5E7EB', alignSelf: message.isUser ? 'flex-end' : 'flex-start' }]}
            accessibilityLabel={message.text}
          >
            <Text style={[styles.messageText, { color: message.isUser ? '#FFFFFF' : '#1F2937' }]}>
              {message.text}
            </Text>
          </Animatable.View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor="#9CA3AF"
          editable={!isLoading}
          accessibilityLabel="Chat input"
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: isLoading ? '#9CA3AF' : '#10B981' }]}
          onPress={handleSend}
          disabled={isLoading}
          accessibilityLabel="Send message"
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  chatContainer: { flex: 1, padding: 10 },
  messageBubble: { padding: 12, margin: 8, borderRadius: 12, maxWidth: '80%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  messageText: { fontSize: 16 },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  input: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 8, marginRight: 8 },
  sendButton: { borderRadius: 8, padding: 10, justifyContent: 'center' },
  sendButtonText: { color: '#FFFFFF', fontSize: 16 },
});