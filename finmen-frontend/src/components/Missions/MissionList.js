import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MissionList() {
  const [activeMission, setActiveMission] = useState(null);
  const [missions, setMissions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const response = await axios.get('http://192.168.0.109:5000/api/mission', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMissions(response.data);
    } catch (err) {
      setError('Failed to load missions.');
    }
  };

  const getDifficultyColor = (difficulty) => ({
    Beginner: '#10B981',
    Intermediate: '#F59E0B',
    Advanced: '#EF4444',
  }[difficulty] || '#6B7280');

  const ProgressBar = ({ progress, color }) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: color }]} />
    </View>
  );

  const TaskItem = ({ task, completed }) => (
    <View style={[styles.taskItem, { backgroundColor: completed ? '#F0FDF4' : '#F9FAFB', borderColor: completed ? '#10B981' : '#E5E7EB' }]}>
      <View style={[styles.taskCheck, { backgroundColor: completed ? '#10B981' : '#E5E7EB' }]}>
        {completed && <Text style={styles.checkMark}>✓</Text>}
      </View>
      <Text style={[styles.taskText, { color: completed ? '#059669' : '#374151', textDecorationLine: completed ? 'line-through' : 'none' }]}>{task}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} accessibilityRole="header">Financial Missions</Text>
        <Text style={styles.headerSubtitle} accessibilityHint="Describes mission purpose">Complete challenges to build healthy money habits</Text>
      </View>

      <Animatable.View animation="fadeInUp" duration={600} style={styles.statsOverview}>
        <Text style={styles.statsTitle} accessibilityRole="header">Your Progress</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem} accessibilityLabel={`Active missions: ${missions.length}`}>
            <Text style={styles.statValue}>{missions.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem} accessibilityLabel="Points: 0">
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statItem} accessibilityLabel={`Average progress: ${missions.length ? Math.round(missions.reduce((sum, m) => sum + m.progress, 0) / missions.length) : 0}%`}>
            <Text style={styles.statValue}>{missions.length ? Math.round(missions.reduce((sum, m) => sum + m.progress, 0) / missions.length) : 0}%</Text>
            <Text style={styles.statLabel}>Avg Progress</Text>
          </View>
          <View style={styles.statItem} accessibilityLabel="Badges: 0">
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>
      </Animatable.View>

      {error ? (
        <Text style={styles.errorText} accessibilityRole="alert">{error}</Text>
      ) : missions.length === 0 ? (
        <Text style={styles.noMissionsText} accessibilityHint="No missions available">No missions available. Create or discover new ones!</Text>
      ) : (
        missions.map((mission, index) => (
          <Animatable.View
            key={mission._id}
            animation="fadeInUp"
            duration={600}
            delay={index * 100}
            style={styles.missionCardContainer}
          >
            <TouchableOpacity
              onPress={() => setActiveMission(activeMission === mission._id ? null : mission._id)}
              style={[styles.missionCard, { borderColor: activeMission === mission._id ? mission.color : '#F3F4F6' }]}
              accessibilityLabel={`Mission: ${mission.title}, Difficulty: ${mission.difficulty}`}
              accessibilityHint={activeMission === mission._id ? 'Tap to collapse' : 'Tap to expand'}
            >
              <View style={styles.missionHeader}>
                <View style={[styles.missionIcon, { backgroundColor: mission.bgColor }]}>
                  <Text style={styles.missionEmoji}>{mission.emoji}</Text>
                </View>
                <View style={styles.missionDetails}>
                  <View style={styles.missionTitleRow}>
                    <Text style={styles.missionTitle} numberOfLines={1}>{mission.title}</Text>
                    <View style={[styles.difficultyTag, { backgroundColor: mission.bgColor }]}>
                      <Text style={[styles.difficultyText, { color: getDifficultyColor(mission.difficulty) }]}>{mission.difficulty}</Text>
                    </View>
                  </View>
                  <Text style={styles.missionDescription} numberOfLines={2}>{mission.description}</Text>
                </View>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressText}>Progress: <Text style={styles.progressValue}>{mission.current}</Text> / <Text style={styles.progressValue}>{mission.target}</Text></Text>
                  <Text style={[styles.progressPercent, { color: getDifficultyColor(mission.difficulty) }]}>{mission.progress}%</Text>
                </View>
                <ProgressBar progress={mission.progress} color={getDifficultyColor(mission.difficulty)} />
                <View style={styles.progressFooter}>
                  <Text style={styles.rewardText}>🎯 <Text style={styles.rewardValue}>{mission.reward}</Text></Text>
                  <Text style={styles.timeLeftText}>⏰ <Text style={styles.timeLeftValue}>{mission.timeLeft}</Text></Text>
                </View>
              </View>

              {activeMission === mission._id && (
                <Animatable.View animation="fadeInDown" duration={300} style={styles.tasksSection}>
                  <Text style={styles.tasksTitle} accessibilityRole="header">Mission Tasks</Text>
                  {mission.tasks.map((taskItem, taskIndex) => (
                    <TaskItem key={taskIndex} task={taskItem.task} completed={taskItem.completed} />
                  ))}
                  <TouchableOpacity style={[styles.continueButton, { backgroundColor: getDifficultyColor(mission.difficulty) }]}>
                    <Text style={styles.continueButtonText}>Continue Mission</Text>
                  </TouchableOpacity>
                </Animatable.View>
              )}

              <View style={styles.tapIndicator}>
                <Text style={styles.tapText}>{activeMission === mission._id ? '▲ Tap to collapse' : '▼ Tap to expand'}</Text>
              </View>
            </TouchableOpacity>
          </Animatable.View>
        ))
      )}

      <TouchableOpacity style={styles.addMissionButton} accessibilityLabel="Discover new missions">
        <Text style={styles.addMissionIcon}>➕</Text>
        <Text style={styles.addMissionTitle}>Discover New Missions</Text>
        <Text style={styles.addMissionSubtitle}>Unlock more challenges as you progress</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#F9FAFB' },
  header: { marginBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1F2937' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', fontWeight: '400' },
  statsOverview: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#E5E7EB' },
  statsTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700', color: '#10B981' },
  statLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  errorText: { color: '#DC2626', padding: 10, textAlign: 'center' },
  noMissionsText: { textAlign: 'center', color: '#6B7280', padding: 20 },
  missionCardContainer: { marginBottom: 16 },
  missionCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  missionHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  missionIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  missionEmoji: { fontSize: 24 },
  missionDetails: { flex: 1 },
  missionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  missionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', flex: 1 },
  difficultyTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  difficultyText: { fontSize: 10, fontWeight: '600' },
  missionDescription: { fontSize: 14, color: '#6B7280', fontWeight: '400', lineHeight: 18 },
  progressSection: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginBottom: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  progressText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  progressValue: { fontWeight: '700' },
  progressPercent: { fontSize: 14, fontWeight: '700' },
  progressBarContainer: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden', marginVertical: 8 },
  progressBar: { height: '100%', borderRadius: 4 },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  rewardText: { fontSize: 12, color: '#6B7280' },
  rewardValue: { fontWeight: '600' },
  timeLeftText: { fontSize: 12, color: '#EF4444', fontWeight: '500' },
  timeLeftValue: { fontWeight: '600' },
  tasksSection: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12 },
  tasksTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  taskItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginBottom: 6, borderWidth: 1 },
  taskCheck: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  checkMark: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  taskText: { flex: 1, fontSize: 14, fontWeight: '500' },
  continueButton: { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, marginTop: 12, alignItems: 'center' },
  continueButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  tapIndicator: { alignItems: 'center', marginTop: 8 },
  tapText: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  addMissionButton: { backgroundColor: '#F3F4F6', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed', marginBottom: 20 },
  addMissionIcon: { fontSize: 32, marginBottom: 8 },
  addMissionTitle: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
  addMissionSubtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
});