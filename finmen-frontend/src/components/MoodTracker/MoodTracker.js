import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Dimensions, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import * as Animatable from 'react-native-animatable';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [journal, setJournal] = useState('');
  const [note, setNote] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [moodHistory, setMoodHistory] = useState([]);
  const [healCoinBalance, setHealCoinBalance] = useState(0);
  const [xp, setXp] = useState(0);
  const [badges, setBadges] = useState([]);
  const [streak, setStreak] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [parentalOversight, setParentalOversight] = useState(false);

  const moods = [
    { emoji: '😊', label: 'Happy', color: '#FEF3C7', description: 'Feeling great today!' },
    { emoji: '😌', label: 'Calm', color: '#D1FAE5', description: 'Peaceful and relaxed' },
    { emoji: '😐', label: 'Neutral', color: '#F3F4F6', description: 'Just okay today' },
    { emoji: '😔', label: 'Sad', color: '#DBEAFE', description: 'Having a tough time' },
    { emoji: '😡', label: 'Angry', color: '#FEE2E2', description: 'Feeling frustrated' },
    { emoji: '😴', label: 'Tired', color: '#E0E7FF', description: 'Need some rest' },
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('jwtToken');
      const response = await axios.get('http://192.168.0.106:5000/api/healcoin/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { healCoins, xp, badges, streak } = response.data;
      setHealCoinBalance(healCoins || 0);
      setXp(xp || 0);
      setBadges(badges || []);
      setStreak(streak || 0);

      const moodRes = await axios.get('http://192.168.0.106:5000/api/mood', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedMoods = moodRes.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 7);
      setMoodHistory(sortedMoods);
    } catch (err) {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHealCoinBalance = async (token) => {
    try {
      const response = await axios.get('http://192.168.0.106:5000/api/healcoin/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { healCoins, xp, badges, streak } = response.data;
      setHealCoinBalance(healCoins || 0);
      setXp(xp || 0);
      setBadges(badges || []);
      setStreak(streak || 0);
    } catch (err) {
      console.error('Error fetching HealCoin balance:', err);
      setError('Failed to update HealCoin balance.');
    }
  };

  const handleMoodSelect = async (moodIndex) => {
    setSelectedMood(moodIndex);
    setShowFeedback(true);
    setError('');
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('jwtToken');
      await axios.post(
        'http://192.168.0.106:5000/api/mood',
        { mood: moods[moodIndex].label.toLowerCase(), note, journal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchHealCoinBalance(token);
      setNote('');
      setJournal('');
    } catch (err) {
      setError('Failed to log mood. Try again.');
    } finally {
      setLoading(false);
    }

    setTimeout(() => setShowFeedback(false), 3000);
  };

  const handleRedeem = (item, amount) => {
    Alert.alert('Confirm Redemption', `Redeem ${amount} HealCoins for ${item}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Redeem',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('jwtToken');
            await axios.post(
              'http://192.168.0.106:5000/api/healcoin/redeem',
              { item, amount },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchHealCoinBalance(token);
            Alert.alert('Success', `Redeemed ${amount} HealCoins for ${item}`);
          } catch (err) {
            setError('Redemption failed.');
          }
        },
      },
    ]);
  };

  const getCurrentDate = () => new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const getDayIndex = (timestamp) => new Date(timestamp).getDay();

  const isSmallScreen = screenWidth < 380;
  const isMediumScreen = screenWidth < 480;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { fontSize: isSmallScreen ? 20 : 24 }]} accessibilityRole="header">
            How are you feeling?
          </Text>
          <Text style={[styles.headerSubtitle, { fontSize: isSmallScreen ? 12 : 14 }]} accessibilityHint="Current date">
            {getCurrentDate()}
          </Text>
        </View>

        <View style={[styles.moodGrid, { 
          marginHorizontal: isSmallScreen ? -4 : 0,
          paddingHorizontal: isSmallScreen ? 4 : 0 
        }]}>
          {moods.map((mood, index) => (
            <Animatable.View
              key={index}
              animation={selectedMood === index ? 'pulse' : undefined}
              duration={600}
              style={[styles.moodItem, { 
                width: isSmallScreen ? '30%' : '31%',
                marginBottom: isSmallScreen ? 8 : 12 
              }]}
            >
              <TouchableOpacity
                onPress={() => handleMoodSelect(index)}
                style={[
                  styles.moodButton, 
                  { 
                    backgroundColor: selectedMood === index ? mood.color : '#F9FAFB', 
                    borderColor: selectedMood === index ? '#1F2937' : '#E5E7EB',
                    minHeight: isSmallScreen ? 80 : 90
                  }
                ]}
                accessibilityLabel={`${mood.label} mood`}
                accessibilityHint={selectedMood === index ? 'Selected' : 'Select to log'}
                disabled={loading}
              >
                {loading && selectedMood === index ? (
                  <ActivityIndicator size="small" color="#1F2937" />
                ) : (
                  <>
                    <Text style={[styles.moodEmoji, { fontSize: isSmallScreen ? 24 : 32 }]}>
                      {mood.emoji}
                    </Text>
                    <Text style={[
                      styles.moodLabel, 
                      { 
                        fontWeight: selectedMood === index ? '700' : '600', 
                        color: selectedMood === index ? '#1F2937' : '#374151',
                        fontSize: isSmallScreen ? 10 : 12
                      }
                    ]}>
                      {mood.label}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>

        {selectedMood !== null && (
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.noteInput, { fontSize: isSmallScreen ? 13 : 14 }]}
              placeholder="Add a short note (optional)"
              value={note}
              onChangeText={setNote}
              maxLength={100}
              accessibilityLabel="Short note input"
              multiline={true}
              textAlignVertical="top"
            />
            <TextInput
              style={[styles.journalInput, { 
                fontSize: isSmallScreen ? 13 : 14,
                height: isSmallScreen ? 80 : 100 
              }]}
              placeholder="Write your journal entry (optional)"
              value={journal}
              onChangeText={setJournal}
              multiline
              numberOfLines={isSmallScreen ? 3 : 4}
              maxLength={500}
              accessibilityLabel="Journal entry input"
              textAlignVertical="top"
            />
          </View>
        )}

        {error ? (
          <Animatable.View animation="fadeIn" style={styles.errorContainer}>
            <Text style={[styles.errorText, { fontSize: isSmallScreen ? 13 : 14 }]}>
              {error}
            </Text>
          </Animatable.View>
        ) : null}

        {showFeedback && selectedMood !== null && (
          <Animatable.View 
            animation="fadeInUp" 
            duration={500} 
            style={[styles.feedbackContainer, { backgroundColor: moods[selectedMood].color }]}
          >
            <View style={styles.feedbackHeader}>
              <Text style={[styles.feedbackEmoji, { fontSize: isSmallScreen ? 24 : 28 }]}>
                {moods[selectedMood].emoji}
              </Text>
              <View style={styles.feedbackTextContainer}>
                <Text style={[styles.feedbackTitle, { fontSize: isSmallScreen ? 16 : 18 }]}>
                  Feeling {moods[selectedMood].label}
                </Text>
                <Text style={[styles.feedbackDescription, { fontSize: isSmallScreen ? 12 : 14 }]}>
                  {moods[selectedMood].description}
                </Text>
              </View>
            </View>
            <Text style={[styles.feedbackConfirmation, { fontSize: isSmallScreen ? 12 : 13 }]}>
              Your mood has been recorded ✓
            </Text>
            <Text style={[styles.feedbackNote, { fontSize: isSmallScreen ? 12 : 13 }]}>
              Earned: 10 HealCoins, 50 XP | New Balance: {healCoinBalance} HealCoins
            </Text>
            {note ? (
              <Text style={[styles.feedbackNote, { fontSize: isSmallScreen ? 12 : 13 }]}>
                Note: {note}
              </Text>
            ) : null}
            {journal ? (
              <Text style={[styles.feedbackNote, { fontSize: isSmallScreen ? 12 : 13 }]}>
                Journal: {journal}
              </Text>
            ) : null}
            {badges.length > 0 && (
              <Text style={[styles.feedbackNote, { fontSize: isSmallScreen ? 12 : 13 }]}>
                New Badge: {badges[badges.length - 1]}
              </Text>
            )}
          </Animatable.View>
        )}

        <View style={styles.weekOverview}>
          <Text style={[styles.weekTitle, { fontSize: isSmallScreen ? 14 : 16 }]} accessibilityRole="header">
            This Week
          </Text>
          <ScrollView 
            horizontal={true} 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weekScrollContent}
          >
            <View style={styles.weekRow}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const adjustedIndex = (index + 1) % 7;
                const mood = moodHistory.find(m => getDayIndex(m.timestamp) === adjustedIndex);
                const moodObj = mood ? moods.find(m => m.emoji === mood.emoji) : null;
                return (
                  <View 
                    key={index} 
                    style={[styles.dayItem, { minWidth: isSmallScreen ? 45 : 50 }]} 
                    accessibilityLabel={`${day} mood: ${moodObj ? moodObj.label : 'None'}`}
                  >
                    <Text style={[styles.dayLabel, { fontSize: isSmallScreen ? 10 : 11 }]}>
                      {day}
                    </Text>
                    <View style={[
                      styles.dayCircle, 
                      { 
                        backgroundColor: moodObj ? moodObj.color : '#E5E7EB', 
                        borderColor: moodObj ? '#1F2937' : '#D1D5DB',
                        width: isSmallScreen ? 28 : 30,
                        height: isSmallScreen ? 28 : 30,
                        borderRadius: isSmallScreen ? 14 : 15
                      }
                    ]}>
                      <Text style={[
                        styles.dayEmoji, 
                        { 
                          color: moodObj ? '#1F2937' : '#9CA3AF',
                          fontSize: isSmallScreen ? 12 : 14
                        }
                      ]}>
                        {moodObj ? moodObj.emoji : '○'}
                      </Text>
                    </View>
                    {mood && (mood.note || mood.journal) ? (
                      <View style={styles.moodDetails}>
                        {mood.note ? (
                          <Text style={[styles.detailText, { fontSize: isSmallScreen ? 9 : 10 }]}>
                            Note: {mood.note}
                          </Text>
                        ) : null}
                        {mood.journal ? (
                          <Text style={[styles.detailText, { fontSize: isSmallScreen ? 9 : 10 }]}>
                            Journal: {mood.journal}
                          </Text>
                        ) : null}
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View style={styles.balanceContainer}>
          <Text style={[styles.balanceText, { fontSize: isSmallScreen ? 14 : 16 }]}>
            HealCoin Balance: {loading ? <ActivityIndicator size="small" color="#1F2937" /> : healCoinBalance}
          </Text>
          <Text style={[styles.balanceText, { fontSize: isSmallScreen ? 12 : 14 }]}>
            XP: {xp} | Streak: {streak} days
          </Text>
          {badges.length > 0 && (
            <Text style={[styles.balanceText, { fontSize: isSmallScreen ? 12 : 14 }]}>
              Badges: {badges.join(', ')}
            </Text>
          )}
        </View>

        <View style={styles.redeemContainer}>
          <TouchableOpacity
            style={styles.redeemButton}
            onPress={() => handleRedeem('Stationery Voucher', 50)}
            disabled={healCoinBalance < 50}
          >
            <Text style={styles.redeemButtonText}>Redeem 50 HealCoins for Stationery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.redeemButton}
            onPress={() => handleRedeem('Food Voucher', 30)}
            disabled={healCoinBalance < 30}
          >
            <Text style={styles.redeemButtonText}>Redeem 30 HealCoins for Food</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.parentalContainer}>
          <TouchableOpacity
            style={styles.parentalButton}
            onPress={() => setParentalOversight(!parentalOversight)}
          >
            <Text style={styles.parentalButtonText}>
              {parentalOversight ? 'Disable Parental Oversight' : 'Enable Parental Oversight'}
            </Text>
          </TouchableOpacity>
        </View>

        {selectedMood !== null && (
          <Animatable.View animation="fadeIn" delay={1000} style={styles.motivationContainer}>
            <Text style={[styles.motivationText, { fontSize: isSmallScreen ? 13 : 14 }]}>
              "Every feeling is valid. You're doing great by checking in with yourself."
            </Text>
          </Animatable.View>
        )}
        
        {/* Add some bottom padding for better scrolling */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB' 
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  header: { 
    marginBottom: 20 
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#1F2937' 
  },
  headerSubtitle: { 
    fontSize: 14, 
    color: '#6B7280', 
    fontWeight: '400',
    marginTop: 4
  },
  moodGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    marginBottom: 20 
  },
  moodItem: { 
    width: '31%', 
    marginBottom: 12 
  },
  moodButton: { 
    aspectRatio: 1, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 6, 
    elevation: 2,
    paddingVertical: 8,
    paddingHorizontal: 4
  },
  moodEmoji: { 
    fontSize: 32, 
    marginBottom: 4 
  },
  moodLabel: { 
    fontSize: 12, 
    textAlign: 'center', 
    textShadowColor: 'rgba(0, 0, 0, 0.1)', 
    textShadowOffset: { width: 0, height: 1 }, 
    textShadowRadius: 2,
    lineHeight: 14
  },
  inputContainer: { 
    marginBottom: 16 
  },
  noteInput: { 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 12, 
    fontSize: 14, 
    backgroundColor: '#FFFFFF',
    minHeight: 44
  },
  journalInput: { 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 8, 
    padding: 12, 
    fontSize: 14, 
    backgroundColor: '#FFFFFF', 
    textAlignVertical: 'top', 
    height: 100 
  },
  errorContainer: { 
    backgroundColor: '#FEF2F2', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16, 
    borderLeftWidth: 4, 
    borderLeftColor: '#EF4444' 
  },
  errorText: { 
    color: '#DC2626', 
    fontSize: 14, 
    fontWeight: '500' 
  },
  feedbackContainer: { 
    backgroundColor: '#D1FAE5', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16, 
    borderLeftWidth: 3, 
    borderLeftColor: '#1F2937' 
  },
  feedbackHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 6 
  },
  feedbackEmoji: { 
    fontSize: 28, 
    marginRight: 12 
  },
  feedbackTextContainer: {
    flex: 1
  },
  feedbackTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1F2937', 
    marginBottom: 2 
  },
  feedbackDescription: { 
    fontSize: 14, 
    color: '#4B5563', 
    fontWeight: '500' 
  },
  feedbackConfirmation: { 
    fontSize: 13, 
    color: '#6B7280', 
    fontStyle: 'italic', 
    fontWeight: '500' 
  },
  feedbackNote: { 
    fontSize: 13, 
    color: '#4B5563', 
    marginTop: 4 
  },
  weekOverview: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: '#E5E7EB',
    marginBottom: 16
  },
  weekTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#1F2937', 
    marginBottom: 12 
  },
  weekScrollContent: {
    paddingHorizontal: 4
  },
  weekRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    minWidth: screenWidth - 64, // Account for padding
  },
  dayItem: { 
    alignItems: 'center', 
    marginHorizontal: 2
  },
  dayLabel: { 
    fontSize: 11, 
    color: '#6B7280', 
    fontWeight: '600', 
    marginBottom: 8 
  },
  dayCircle: { 
    width: 30, 
    height: 30, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1 
  },
  dayEmoji: { 
    fontSize: 14 
  },
  moodDetails: { 
    marginTop: 8, 
    alignItems: 'center' 
  },
  detailText: { 
    fontSize: 10, 
    color: '#4B5563', 
    textAlign: 'center', 
    maxWidth: 80,
    lineHeight: 12
  },
  motivationContainer: { 
    marginTop: 8, 
    padding: 16, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E5E7EB' 
  },
  motivationText: { 
    fontSize: 14, 
    color: '#6B7280', 
    textAlign: 'center', 
    fontStyle: 'italic', 
    lineHeight: 20, 
    fontWeight: '500' 
  },
  balanceContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  balanceText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '700',
  },
  redeemContainer: {
    marginBottom: 16,
  },
  redeemButton: {
    backgroundColor: '#4B5563',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    opacity: 0.7,
  },
  redeemButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  parentalContainer: {
    marginBottom: 16,
  },
  parentalButton: {
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
  },
  parentalButtonText: {
    color: '#1F2937',
    textAlign: 'center',
    fontWeight: '600',
  },
});