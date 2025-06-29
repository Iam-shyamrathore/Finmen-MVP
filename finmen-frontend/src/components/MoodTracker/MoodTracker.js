import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity,StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [moodHistory, setMoodHistory] = useState([]);
  const [error, setError] = useState('');

  const moods = [
    { emoji: '😊', label: 'Happy', color: '#FEF3C7', description: 'Feeling great today!' },
    { emoji: '😌', label: 'Calm', color: '#D1FAE5', description: 'Peaceful and relaxed' },
    { emoji: '😐', label: 'Neutral', color: '#F3F4F6', description: 'Just okay today' },
    { emoji: '😔', label: 'Sad', color: '#DBEAFE', description: 'Having a tough time' },
    { emoji: '😡', label: 'Angry', color: '#FEE2E2', description: 'Feeling frustrated' },
    { emoji: '😴', label: 'Tired', color: '#E0E7FF', description: 'Need some rest' },
  ];

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  const fetchMoodHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const response = await axios.get('http://192.168.0.109:5000/api/mood', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedMoods = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 7);
      setMoodHistory(sortedMoods);
    } catch (err) {
      setError('Failed to load mood history.');
    }
  };

  const handleMoodSelect = async (moodIndex) => {
    setSelectedMood(moodIndex);
    setShowFeedback(true);
    setError('');

    try {
      const token = await AsyncStorage.getItem('jwtToken');
      await axios.post('http://192.168.0.109:5000/api/mood', { mood: moods[moodIndex].label.toLowerCase() }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchMoodHistory();
    } catch (err) {
      setError('Failed to log mood. Try again.');
    }

    setTimeout(() => setShowFeedback(false), 3000);
  };

  const getCurrentDate = () => new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const getDayIndex = (timestamp) => new Date(timestamp).getDay();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} accessibilityRole="header">How are you feeling?</Text>
        <Text style={styles.headerSubtitle} accessibilityHint="Current date">{getCurrentDate()}</Text>
      </View>

      <View style={styles.moodGrid}>
        {moods.map((mood, index) => (
          <Animatable.View
            key={index}
            animation={selectedMood === index ? 'pulse' : undefined}
            duration={600}
            style={styles.moodItem}
          >
            <TouchableOpacity
              onPress={() => handleMoodSelect(index)}
              style={[styles.moodButton, { backgroundColor: selectedMood === index ? mood.color : '#F9FAFB', borderColor: selectedMood === index ? '#1F2937' : '#E5E7EB' }]}
              accessibilityLabel={`${mood.label} mood`}
              accessibilityHint={selectedMood === index ? 'Selected' : 'Select to log'}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={[styles.moodLabel, { fontWeight: selectedMood === index ? '700' : '600', color: selectedMood === index ? '#1F2937' : '#374151' }]}>{mood.label}</Text>
            </TouchableOpacity>
          </Animatable.View>
        ))}
      </View>

      {error ? (
        <Animatable.View animation="fadeIn" style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </Animatable.View>
      ) : null}

      {showFeedback && selectedMood !== null && (
        <Animatable.View animation="fadeInUp" duration={500} style={[styles.feedbackContainer, { backgroundColor: moods[selectedMood].color }]}>
          <View style={styles.feedbackHeader}>
            <Text style={styles.feedbackEmoji}>{moods[selectedMood].emoji}</Text>
            <View>
              <Text style={styles.feedbackTitle}>Feeling {moods[selectedMood].label}</Text>
              <Text style={styles.feedbackDescription}>{moods[selectedMood].description}</Text>
            </View>
          </View>
          <Text style={styles.feedbackConfirmation}>Your mood has been recorded for today ✓</Text>
        </Animatable.View>
      )}

      <View style={styles.weekOverview}>
        <Text style={styles.weekTitle} accessibilityRole="header">This Week</Text>
        <View style={styles.weekRow}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
            const adjustedIndex = (index + 1) % 7;
            const mood = moodHistory.find(m => getDayIndex(m.timestamp) === adjustedIndex);
            const moodObj = mood ? moods.find(m => m.emoji === mood.emoji) : null;
            return (
              <View key={index} style={styles.dayItem} accessibilityLabel={`${day} mood: ${moodObj ? moodObj.label : 'None'}`}>
                <Text style={styles.dayLabel}>{day}</Text>
                <View style={[styles.dayCircle, { backgroundColor: moodObj ? moodObj.color : '#E5E7EB', borderColor: moodObj ? '#1F2937' : '#D1D5DB' }]}>
                  <Text style={[styles.dayEmoji, { color: moodObj ? '#1F2937' : '#9CA3AF' }]}>{moodObj ? moodObj.emoji : '○'}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {selectedMood !== null && (
        <Animatable.View animation="fadeIn" delay={1000} style={styles.motivationContainer}>
          <Text style={styles.motivationText}>
            "Every feeling is valid. You're doing great by checking in with yourself."
          </Text>
        </Animatable.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F9FAFB' },
  header: { marginBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1F2937' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', fontWeight: '400' },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  moodItem: { width: '31%', marginBottom: 12 },
  moodButton: { aspectRatio: 1, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  moodEmoji: { fontSize: 32, marginBottom: 6 },
  moodLabel: { fontSize: 12, textAlign: 'center', textShadowColor: 'rgba(0, 0, 0, 0.1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  errorContainer: { backgroundColor: '#FEF2F2', borderRadius: 12, padding: 16, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#EF4444' },
  errorText: { color: '#DC2626', fontSize: 14, fontWeight: '500' },
  feedbackContainer: { backgroundColor: '#D1FAE5', borderRadius: 12, padding: 16, marginBottom: 20, borderLeftWidth: 3, borderLeftColor: '#1F2937' },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  feedbackEmoji: { fontSize: 28, marginRight: 10 },
  feedbackTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  feedbackDescription: { fontSize: 14, color: '#4B5563', fontWeight: '500' },
  feedbackConfirmation: { fontSize: 13, color: '#6B7280', fontStyle: 'italic', fontWeight: '500' },
  weekOverview: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  weekTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayItem: { alignItems: 'center' },
  dayLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600', marginBottom: 8 },
  dayCircle: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  dayEmoji: { fontSize: 14 },
  motivationContainer: { marginTop: 16, padding: 16, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  motivationText: { fontSize: 14, color: '#6B7280', textAlign: 'center', fontStyle: 'italic', lineHeight: 20, fontWeight: '500' },
});