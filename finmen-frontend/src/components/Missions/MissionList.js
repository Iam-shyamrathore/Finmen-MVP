import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  TextInput, 
  Modal, 
  Alert, 
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function MissionList() {
  const [activeMission, setActiveMission] = useState(null);
  const [missions, setMissions] = useState([]);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    target: '',
    category: 'Saving',
    difficulty: 'Beginner',
    tasks: [{ task: '', completed: false }],
    reward: '',
    timeLeft: '',
  });

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const response = await axios.get('https://finmen-mvp.onrender.com/api/mission', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMissions(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load missions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Beginner: '#22C55E',
      Intermediate: '#F59E0B',
      Advanced: '#EF4444',
    };
    return colors[difficulty] || '#6B7280';
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      Saving: '💰',
      Investment: '📈',
      Budgeting: '📊',
      Debt: '💳',
      Emergency: '🚨',
    };
    return emojis[category] || '🎯';
  };

  const ProgressBar = ({ progress, color }) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${Math.min(progress, 100)}%`, backgroundColor: color }
          ]} 
        />
      </View>
    </View>
  );

  const TaskItem = ({ task, completed, onToggle, index }) => (
    <Animatable.View 
      animation="fadeInUp"
      delay={index * 100}
      style={[
        styles.taskItem, 
        { 
          backgroundColor: completed ? '#F0FDF4' : '#FFFFFF',
          borderColor: completed ? '#22C55E' : '#E5E7EB'
        }
      ]}
    >
      <TouchableOpacity 
        style={[
          styles.taskCheckbox,
          { 
            backgroundColor: completed ? '#22C55E' : 'transparent',
            borderColor: completed ? '#22C55E' : '#D1D5DB'
          }
        ]} 
        onPress={onToggle}
        activeOpacity={0.7}
      >
        {completed && <Text style={styles.checkMark}>✓</Text>}
      </TouchableOpacity>
      <Text 
        style={[
          styles.taskText, 
          { 
            color: completed ? '#059669' : '#374151',
            textDecorationLine: completed ? 'line-through' : 'none'
          }
        ]}
      >
        {task}
      </Text>
    </Animatable.View>
  );

  const validateMission = () => {
    if (!newMission.title.trim()) {
      setError('Mission title is required');
      return false;
    }
    if (!newMission.target.trim()) {
      setError('Target amount is required');
      return false;
    }
    if (!newMission.reward.trim()) {
      setError('Reward amount is required');
      return false;
    }
    if (!newMission.timeLeft.trim()) {
      setError('Time limit is required');
      return false;
    }
    if (newMission.tasks.some(task => !task.task.trim())) {
      setError('All tasks must have descriptions');
      return false;
    }
    return true;
  };

  const handleCreateMission = async () => {
    if (!validateMission()) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      await axios.post(
        'https://finmen-mvp.onrender.com/api/mission',
        {
          title: newMission.title,
          description: newMission.description,
          target: newMission.target,
          current: '0',
          category: newMission.category,
          difficulty: newMission.difficulty,
          tasks: newMission.tasks.filter(task => task.task.trim()),
          reward: parseInt(newMission.reward),
          timeLeft: newMission.timeLeft,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setModalVisible(false);
      resetForm();
      await fetchMissions();
      Alert.alert('Success', 'Mission created successfully!');
    } catch (err) {
      setError('Failed to create mission. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewMission({
      title: '',
      description: '',
      target: '',
      category: 'Saving',
      difficulty: 'Beginner',
      tasks: [{ task: '', completed: false }],
      reward: '',
      timeLeft: '',
    });
    setError('');
  };

  const handleAddTask = () => {
    if (newMission.tasks.length < 10) {
      setNewMission(prev => ({
        ...prev,
        tasks: [...prev.tasks, { task: '', completed: false }]
      }));
    }
  };

  const handleRemoveTask = (index) => {
    if (newMission.tasks.length > 1) {
      setNewMission(prev => ({
        ...prev,
        tasks: prev.tasks.filter((_, i) => i !== index)
      }));
    }
  };

  const handleTaskChange = (index, value) => {
    setNewMission(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => 
        i === index ? { ...task, task: value } : task
      )
    }));
  };

  const handleTaskToggle = (index) => {
    setNewMission(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => 
        i === index ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const calculateStats = () => {
    const completedMissions = missions.filter(m => m.progress >= 100).length;
    const totalProgress = missions.length > 0 
      ? Math.round(missions.reduce((sum, m) => sum + m.progress, 0) / missions.length) 
      : 0;
    const totalPoints = missions.reduce((sum, m) => sum + (m.progress >= 100 ? m.reward : 0), 0);
    
    return { completedMissions, totalProgress, totalPoints };
  };

  const { completedMissions, totalProgress, totalPoints } = calculateStats();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Financial Missions</Text>
          <Text style={styles.headerSubtitle}>
            Complete challenges to build healthy money habits
          </Text>
        </View>

        {/* Stats Overview */}
        <Animatable.View animation="fadeInUp" duration={600} style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{missions.length}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedMissions}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalProgress}%</Text>
              <Text style={styles.statLabel}>Avg Progress</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalPoints}</Text>
              <Text style={styles.statLabel}>HealCoins</Text>
            </View>
          </View>
        </Animatable.View>

        {/* Error Message */}
        {error ? (
          <Animatable.View animation="shake" style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </Animatable.View>
        ) : null}

        {/* Missions List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading missions...</Text>
          </View>
        ) : missions.length === 0 ? (
          <Animatable.View animation="fadeIn" style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🎯</Text>
            <Text style={styles.emptyStateTitle}>No missions yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Create your first mission to start building better financial habits
            </Text>
          </Animatable.View>
        ) : (
          missions.map((mission, index) => (
            <Animatable.View
              key={mission._id}
              animation="fadeInUp"
              duration={600}
              delay={index * 100}
              style={styles.missionContainer}
            >
              <TouchableOpacity
                onPress={() => setActiveMission(
                  activeMission === mission._id ? null : mission._id
                )}
                style={[
                  styles.missionCard,
                  { 
                    borderColor: activeMission === mission._id 
                      ? getDifficultyColor(mission.difficulty) 
                      : '#E5E7EB'
                  }
                ]}
                activeOpacity={0.95}
              >
                {/* Mission Header */}
                <View style={styles.missionHeader}>
                  <View style={[
                    styles.missionIcon,
                    { backgroundColor: `${getDifficultyColor(mission.difficulty)}20` }
                  ]}>
                    <Text style={styles.missionEmoji}>
                      {getCategoryEmoji(mission.category)}
                    </Text>
                  </View>
                  <View style={styles.missionInfo}>
                    <View style={styles.missionTitleRow}>
                      <Text style={styles.missionTitle} numberOfLines={2}>
                        {mission.title}
                      </Text>
                      <View style={[
                        styles.difficultyBadge,
                        { backgroundColor: getDifficultyColor(mission.difficulty) }
                      ]}>
                        <Text style={styles.difficultyText}>
                          {mission.difficulty}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.missionDescription} numberOfLines={2}>
                      {mission.description}
                    </Text>
                  </View>
                </View>

                {/* Progress Section */}
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>
                      Progress: {mission.current} / {mission.target}
                    </Text>
                    <Text style={[
                      styles.progressPercent,
                      { color: getDifficultyColor(mission.difficulty) }
                    ]}>
                      {mission.progress}%
                    </Text>
                  </View>
                  <ProgressBar 
                    progress={mission.progress} 
                    color={getDifficultyColor(mission.difficulty)} 
                  />
                  <View style={styles.progressFooter}>
                    <Text style={styles.rewardText}>
                      🎯 {mission.reward} HealCoins
                    </Text>
                    <Text style={styles.timeText}>
                      ⏰ {mission.timeLeft}
                    </Text>
                  </View>
                </View>

                {/* Tasks Section (Expandable) */}
                {activeMission === mission._id && (
                  <Animatable.View 
                    animation="fadeInDown" 
                    duration={300} 
                    style={styles.tasksSection}
                  >
                    <Text style={styles.tasksTitle}>Mission Tasks</Text>
                    {mission.tasks.map((taskItem, taskIndex) => (
                      <TaskItem 
                        key={taskIndex}
                        task={taskItem.task}
                        completed={taskItem.completed}
                        index={taskIndex}
                        onToggle={() => {
                          // Handle task toggle here
                        }}
                      />
                    ))}
                  </Animatable.View>
                )}

                {/* Expand/Collapse Indicator */}
                <View style={styles.expandIndicator}>
                  <Text style={styles.expandText}>
                    {activeMission === mission._id ? '▲ Tap to collapse' : '▼ Tap to expand'}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animatable.View>
          ))
        )}

        {/* Add Mission Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonTitle}>Create New Mission</Text>
          <Text style={styles.addButtonSubtitle}>
            Design your own financial challenge
          </Text>
        </TouchableOpacity>

        {/* Create Mission Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
            resetForm();
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ScrollView 
                style={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.modalTitle}>Create New Mission</Text>
                
                {/* Basic Info */}
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Basic Information</Text>
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Mission Title"
                    placeholderTextColor="#9CA3AF"
                    value={newMission.title}
                    onChangeText={(text) => setNewMission(prev => ({ ...prev, title: text }))}
                  />
                  
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Description (optional)"
                    placeholderTextColor="#9CA3AF"
                    value={newMission.description}
                    onChangeText={(text) => setNewMission(prev => ({ ...prev, description: text }))}
                    multiline
                    numberOfLines={3}
                  />
                  
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[styles.input, styles.halfInput]}
                      placeholder="Target (₹)"
                      placeholderTextColor="#9CA3AF"
                      value={newMission.target}
                      onChangeText={(text) => setNewMission(prev => ({ ...prev, target: text }))}
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={[styles.input, styles.halfInput]}
                      placeholder="Reward (HealCoins)"
                      placeholderTextColor="#9CA3AF"
                      value={newMission.reward}
                      onChangeText={(text) => setNewMission(prev => ({ ...prev, reward: text }))}
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Time Limit (e.g., 30 days)"
                    placeholderTextColor="#9CA3AF"
                    value={newMission.timeLeft}
                    onChangeText={(text) => setNewMission(prev => ({ ...prev, timeLeft: text }))}
                  />
                  
                  <View style={styles.inputRow}>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}>Category</Text>
                      <TextInput
                        style={styles.input}
                        value={newMission.category}
                        onChangeText={(text) => setNewMission(prev => ({ ...prev, category: text }))}
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}>Difficulty</Text>
                      <TextInput
                        style={styles.input}
                        value={newMission.difficulty}
                        onChangeText={(text) => setNewMission(prev => ({ ...prev, difficulty: text }))}
                      />
                    </View>
                  </View>
                </View>

                {/* Tasks Section */}
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Tasks</Text>
                  
                  {newMission.tasks.map((task, index) => (
                    <View key={index} style={styles.taskInputRow}>
                      <TextInput
                        style={[styles.input, styles.taskInput]}
                        placeholder={`Task ${index + 1}`}
                        placeholderTextColor="#9CA3AF"
                        value={task.task}
                        onChangeText={(text) => handleTaskChange(index, text)}
                      />
                      <TouchableOpacity
                        style={styles.taskToggleButton}
                        onPress={() => handleTaskToggle(index)}
                      >
                        <Text style={styles.taskToggleIcon}>
                          {task.completed ? '✓' : '○'}
                        </Text>
                      </TouchableOpacity>
                      {newMission.tasks.length > 1 && (
                        <TouchableOpacity
                          style={styles.removeTaskButton}
                          onPress={() => handleRemoveTask(index)}
                        >
                          <Text style={styles.removeTaskIcon}>×</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  
                  <TouchableOpacity
                    style={styles.addTaskButton}
                    onPress={handleAddTask}
                    disabled={newMission.tasks.length >= 10}
                  >
                    <Text style={styles.addTaskText}>+ Add Task</Text>
                  </TouchableOpacity>
                </View>

                {/* Modal Actions */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setModalVisible(false);
                      resetForm();
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.createButton, { opacity: loading ? 0.6 : 1 }]}
                    onPress={handleCreateMission}
                    disabled={loading}
                  >
                    <Text style={styles.createButtonText}>
                      {loading ? 'Creating...' : 'Create Mission'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#22C55E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  missionContainer: {
    marginBottom: 16,
  },
  missionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  missionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  missionEmoji: {
    fontSize: 24,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  missionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  progressSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressContainer: {
    marginVertical: 8,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rewardText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  tasksSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    marginBottom: 12,
  },
  tasksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  taskText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  expandIndicator: {
    alignItems: 'center',
    paddingTop: 8,
  },
  expandText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addButtonIcon: {
    fontSize: 32,
    color: '#6B7280',
    marginBottom: 8,
  },
  addButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  addButtonSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: width - 40,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContent: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FAFAFA',
    marginBottom: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  taskInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskInput: {
    flex: 1,
    marginRight: 8,
    marginBottom: 0,
  },
  taskToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  taskToggleIcon: {
    fontSize: 16,
    color: '#6B7280',
  },
  removeTaskButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  removeTaskIcon: {
    fontSize: 20,
    color: '#DC2626',
    fontWeight: '600',
  },
  addTaskButton: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 8,
  },
  addTaskText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#22C55E',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});