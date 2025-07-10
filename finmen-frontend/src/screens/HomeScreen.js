import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
     import {
       View,
       Text,
       ScrollView,
       TouchableOpacity,
       SafeAreaView,
       StyleSheet,
       RefreshControl,
       BackHandler,
       Alert,
       Dimensions,
       Platform,
       StatusBar,
       ActivityIndicator,
     } from 'react-native';
     import AsyncStorage from '@react-native-async-storage/async-storage';
     import { useNavigation, useFocusEffect } from '@react-navigation/native';
     import * as Animatable from 'react-native-animatable';
     import { useSafeAreaInsets } from 'react-native-safe-area-context';
     import axios from 'axios';

     // Import components
     import MoodTracker from '../components/MoodTracker/MoodTracker';
     import ChatbotInterface from '../components/Chatbot/ChatbotInterface';
     import MissionList from '../components/Missions/MissionList';
     import UserDashboard from '../components/Dashboard/UserDashboard';

     const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

     const TABS = {
       DASHBOARD: 'dashboard',
       MOOD: 'mood',
       CHAT: 'chat',
       FINANCE: 'finance',
     };

     const TAB_CONFIG = {
       [TABS.DASHBOARD]: { icon: '🏠', label: 'Dashboard', component: null },
       [TABS.MOOD]: { icon: '😊', label: 'Mood', component: MoodTracker },
       [TABS.CHAT]: { icon: '💬', label: 'Chat', component: ChatbotInterface },
       [TABS.FINANCE]: { icon: '💰', label: 'Finance', component: MissionList },
     };

     const QUICK_ACCESS_CARDS = [
       { id: 'mood', tab: TABS.MOOD, title: 'Mood Tracker', subtitle: 'Track daily mood', icon: '😊', bgColor: '#FEF3C7', gradient: ['#FEF3C7', '#FDE68A'] },
       { id: 'chat', tab: TABS.CHAT, title: 'AI Chat', subtitle: 'Get support', icon: '💬', bgColor: '#DBEAFE', gradient: ['#DBEAFE', '#BFDBFE'] },
       { id: 'finance', tab: TABS.FINANCE, title: 'Finance', subtitle: 'Manage money', icon: '💰', bgColor: '#D1FAE5', gradient: ['#D1FAE5', '#A7F3D0'] },
     ];

     const STORAGE_KEYS = {
       JWT_TOKEN: 'jwtToken',
       USER_NAME: 'userName',
       USER_DATA: 'userData',
       LAST_ACTIVITY: 'lastActivity',
       DASHBOARD_STATS: 'dashboardStats',
     };

     const Logger = {
       info: (message, context = 'HomeScreen') => console.log(`[${new Date().toISOString()}] [${context}] ${message}`),
       error: (error, context = 'HomeScreen') => console.error(`[${new Date().toISOString()}] [${context}]`, error),
     };

     class UserDataService {
       static async getUserData() {
         try {
           const [token, userName] = await Promise.all([
             AsyncStorage.getItem(STORAGE_KEYS.JWT_TOKEN),
             AsyncStorage.getItem(STORAGE_KEYS.USER_NAME),
           ]);
           return { token, userName: userName || 'User' };
         } catch (error) {
           Logger.error(error, 'UserDataService.getUserData');
           return { token: null, userName: 'User' };
         }
       }

       static async updateLastActivity() {
         try {
           await AsyncStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, new Date().toISOString());
         } catch (error) {
           Logger.error(error, 'UserDataService.updateLastActivity');
         }
       }

       static async getDashboardStats() {
         try {
           const stats = await AsyncStorage.getItem(STORAGE_KEYS.DASHBOARD_STATS);
           return stats ? JSON.parse(stats) : {
             moodEntries: 0,
             chatSessions: 0,
             missionsCompleted: 0,
             healCoinBalance: 0,
             weeklyGoal: 7,
           };
         } catch (error) {
           Logger.error(error, 'UserDataService.getDashboardStats');
           return { moodEntries: 0, chatSessions: 0, missionsCompleted: 0, healCoinBalance: 0, weeklyGoal: 7 };
         }
       }
     }

     class ActivityService {
       static async getRecentActivity() {
         try {
           return [
             { id: 1, type: 'mood', title: 'Mood Check-in', time: '2 hours ago', icon: '😊', data: { mood: 'happy' } },
             { id: 2, type: 'chat', title: 'AI Chat Session', time: 'Yesterday', icon: '💬', data: { duration: '15 min' } },
             { id: 3, type: 'finance', title: 'Budget Updated', time: '3 days ago', icon: '📊', data: { amount: '$50' } },
           ];
         } catch (error) {
           Logger.error(error, 'ActivityService.getRecentActivity');
           return [];
         }
       }
     }

     export default function HomeScreen() {
       const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
       const [userData, setUserData] = useState({ userName: 'User', token: null });
       const [dashboardStats, setDashboardStats] = useState({
         moodEntries: 0,
         chatSessions: 0,
         missionsCompleted: 0,
         healCoinBalance: 0,
         weeklyGoal: 7,
       });
       const [recentActivity, setRecentActivity] = useState([]);
       const [isLoading, setIsLoading] = useState(true);
       const [refreshing, setRefreshing] = useState(false);
       const [error, setError] = useState(null);

       const navigation = useNavigation();
       const insets = useSafeAreaInsets();
       const scrollViewRef = useRef(null);
       const animationRefs = useRef({});

       const dynamicStyles = useMemo(() => ({
         container: { flex: 1, backgroundColor: '#FAFAFA', paddingTop: insets.top },
         header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8, backgroundColor: '#FAFAFA' },
         content: { flex: 1, paddingHorizontal: 24 },
         bottomNav: {
           backgroundColor: '#FFFFFF',
           paddingHorizontal: 24,
           paddingVertical: 16,
           paddingBottom: Math.max(insets.bottom, 16),
           borderTopWidth: 1,
           borderTopColor: '#F3F4F6',
         },
       }), [insets]);

       const initializeData = useCallback(async () => {
         try {
           setIsLoading(true);
           setError(null);

           const [userDataResult, statsResult, activityResult] = await Promise.all([
             UserDataService.getUserData(),
             UserDataService.getDashboardStats(),
             ActivityService.getRecentActivity(),
           ]);

           setUserData(userDataResult);
           setDashboardStats(statsResult);
           setRecentActivity(activityResult);

           await UserDataService.updateLastActivity();
           Logger.info('Data initialized successfully');
         } catch (error) {
           Logger.error(error, 'initializeData');
           setError('Failed to load data');
         } finally {
           setIsLoading(false);
         }
       }, []);

       const handleRefresh = useCallback(async () => {
         setRefreshing(true);
         await initializeData();
         setRefreshing(false);
       }, [initializeData]);

       const handleTabChange = useCallback((tab) => {
         if (tab === activeTab) return;
         if (animationRefs.current[tab]) animationRefs.current[tab].fadeIn(300);
         setActiveTab(tab);
         Logger.info(`Tab changed to: ${tab}`);
       }, [activeTab]);

       const handleBackPress = useCallback(() => {
         if (activeTab !== TABS.DASHBOARD) {
           handleTabChange(TABS.DASHBOARD);
           return true;
         }
         return false;
       }, [activeTab, handleTabChange]);

       useEffect(() => {
         initializeData();
       }, [initializeData]);

       useFocusEffect(
         useCallback(() => {
           const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
           return () => backHandler.remove();
         }, [handleBackPress])
       );

       useEffect(() => {
         StatusBar.setBarStyle('dark-content', true);
         if (Platform.OS === 'android') StatusBar.setBackgroundColor('#FAFAFA', true);
       }, []);

       const renderQuickAccessCard = useCallback((card, index) => (
         <TouchableOpacity
           key={card.id}
           onPress={() => handleTabChange(card.tab)}
           style={[styles.quickAccessCard, { marginRight: index < QUICK_ACCESS_CARDS.length - 1 ? 8 : 0 }]}
           activeOpacity={0.8}
         >
           <View style={[styles.quickAccessIcon, { backgroundColor: card.bgColor }]}>
             <Text style={styles.quickAccessEmoji}>{card.icon}</Text>
           </View>
           <Text style={styles.quickAccessTitle}>{card.title}</Text>
           <Text style={styles.quickAccessSubtitle}>{card.subtitle}</Text>
         </TouchableOpacity>
       ), [handleTabChange]);

       const renderActivityItem = useCallback((item, index) => (
         <View
           key={item.id}
           style={[styles.activityItem, { borderBottomWidth: index < recentActivity.length - 1 ? 1 : 0 }]}
         >
           <View style={styles.activityContent}>
             <Text style={styles.activityTitle}>{item.title}</Text>
             <Text style={styles.activityTime}>{item.time}</Text>
           </View>
           <Text style={styles.activityIcon}>{item.icon}</Text>
         </View>
       ), [recentActivity.length]);

       const renderDashboard = useCallback(() => (
         <ScrollView
           ref={scrollViewRef}
           showsVerticalScrollIndicator={false}
           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#10B981']} tintColor="#10B981" />}
           contentContainerStyle={styles.dashboardContent}
         >
           <Animatable.View ref={ref => animationRefs.current.welcome = ref} animation="fadeInDown" duration={800} style={styles.welcomeSection}>
             <Text style={styles.welcomeText}>Welcome back,</Text>
             <Text style={styles.userName}>{userData.userName}</Text>
           </Animatable.View>

           <Animatable.View ref={ref => animationRefs.current.stats = ref} animation="fadeInUp" duration={600} delay={200} style={styles.statsContainer}>
             <UserDashboard stats={dashboardStats} />
           </Animatable.View>

           <Animatable.View ref={ref => animationRefs.current.quickAccess = ref} animation="fadeInUp" duration={600} delay={400} style={styles.quickAccessSection}>
             <Text style={styles.sectionTitle}>Quick Access</Text>
             <View style={styles.quickAccessGrid}>{QUICK_ACCESS_CARDS.map(renderQuickAccessCard)}</View>
           </Animatable.View>

           <Animatable.View ref={ref => animationRefs.current.activity = ref} animation="fadeInUp" duration={600} delay={600} style={styles.recentActivitySection}>
             <Text style={styles.sectionTitle}>Recent Activity</Text>
             <View style={styles.activityContainer}>
               {recentActivity.length > 0 ? recentActivity.map(renderActivityItem) : <Text style={styles.noActivityText}>No recent activity</Text>}
             </View>
           </Animatable.View>
         </ScrollView>
       ), [userData.userName, dashboardStats, recentActivity, refreshing, handleRefresh, renderQuickAccessCard, renderActivityItem]);

       const renderContent = useCallback(() => {
         if (activeTab === TABS.DASHBOARD) return renderDashboard();
         const TabComponent = TAB_CONFIG[activeTab]?.component;
         return TabComponent ? (
           <Animatable.View ref={ref => animationRefs.current[activeTab] = ref} animation="fadeIn" duration={300} style={styles.tabContent}>
             <TabComponent />
           </Animatable.View>
         ) : null;
       }, [activeTab, renderDashboard]);

       const renderBottomNav = useCallback(() => (
         <View style={dynamicStyles.bottomNav}>
           <View style={styles.navContainer}>
             {Object.entries(TAB_CONFIG).map(([key, config]) => (
               <TouchableOpacity
                 key={key}
                 onPress={() => handleTabChange(key)}
                 style={styles.navItem}
                 activeOpacity={0.7}
               >
                 <Text style={[styles.navIcon, { opacity: activeTab === key ? 1 : 0.5 }]}>{config.icon}</Text>
                 <Text style={[styles.navLabel, { color: activeTab === key ? '#000000' : '#666666', fontWeight: activeTab === key ? '600' : '400' }]}>
                   {config.label}
                 </Text>
               </TouchableOpacity>
             ))}
           </View>
         </View>
       ), [activeTab, handleTabChange, dynamicStyles.bottomNav]);

       if (isLoading) {
         return (
           <SafeAreaView style={dynamicStyles.container}>
             <View style={styles.loadingContainer}>
               <ActivityIndicator size="large" color="#10B981" />
               <Text style={styles.loadingText}>Loading...</Text>
             </View>
           </SafeAreaView>
         );
       }

       if (error) {
         return (
           <SafeAreaView style={dynamicStyles.container}>
             <View style={styles.errorContainer}>
               <Text style={styles.errorText}>{error}</Text>
               <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
                 <Text style={styles.retryButtonText}>Retry</Text>
               </TouchableOpacity>
             </View>
           </SafeAreaView>
         );
       }

       return (
         <SafeAreaView style={dynamicStyles.container}>
           <View style={dynamicStyles.header}>
             {activeTab !== TABS.DASHBOARD && (
               <TouchableOpacity onPress={() => handleTabChange(TABS.DASHBOARD)} style={styles.backButton} activeOpacity={0.7}>
                 <Text style={styles.backIcon}>←</Text>
                 <Text style={styles.backText}>Back to Dashboard</Text>
               </TouchableOpacity>
             )}
             {activeTab === TABS.DASHBOARD && (
               <View style={styles.dashboardHeader}>
                 <View style={styles.logoContainer}>
                   <Text style={styles.logoText}>F</Text>
                 </View>
                 <TouchableOpacity style={styles.settingsButton} activeOpacity={0.7}>
                   <Text style={styles.settingsIcon}>⚙️</Text>
                 </TouchableOpacity>
               </View>
             )}
           </View>

           <View style={dynamicStyles.content}>
             {activeTab !== TABS.DASHBOARD ? (
               <View style={styles.contentContainer}>{renderContent()}</View>
             ) : (
               renderContent()
             )}
           </View>

           {renderBottomNav()}
         </SafeAreaView>
       );
     }

     const styles = StyleSheet.create({
       loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
       loadingText: { marginTop: 16, fontSize: 16, color: '#666666' },
       errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
       errorText: { fontSize: 16, color: '#DC2626', textAlign: 'center', marginBottom: 16 },
       retryButton: { backgroundColor: '#10B981', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
       retryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
       backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
       backIcon: { fontSize: 16, color: '#666666', marginRight: 8 },
       backText: { fontSize: 16, color: '#666666', fontWeight: '500' },
       dashboardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
       logoContainer: { width: 40, height: 40, backgroundColor: '#000000', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
       logoText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
       settingsButton: { width: 40, height: 40, backgroundColor: '#F3F4F6', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
       settingsIcon: { fontSize: 20 },
       contentContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, flex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
       tabContent: { flex: 1 },
       dashboardContent: { paddingBottom: 20 },
       welcomeSection: { marginBottom: 32 },
       welcomeText: { fontSize: 16, color: '#666666', fontWeight: '400', marginBottom: 4 },
       userName: { fontSize: 28, fontWeight: '300', color: '#000000', letterSpacing: 0.5 },
       statsContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
       sectionTitle: { fontSize: 18, fontWeight: '600', color: '#000000', marginBottom: 16 },
       quickAccessSection: { marginBottom: 24 },
       quickAccessGrid: { flexDirection: 'row', justifyContent: 'space-between' },
       quickAccessCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
       quickAccessIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
       quickAccessEmoji: { fontSize: 24 },
       quickAccessTitle: { fontSize: 14, fontWeight: '600', color: '#000000', textAlign: 'center' },
       quickAccessSubtitle: { fontSize: 12, color: '#666666', textAlign: 'center', marginTop: 4 },
       recentActivitySection: { marginBottom: 24 },
       activityContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
       activityItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomColor: '#F3F4F6' },
       activityContent: { flex: 1 },
       activityTitle: { fontSize: 14, fontWeight: '500', color: '#000000' },
       activityTime: { fontSize: 12, color: '#666666' },
       activityIcon: { fontSize: 20 },
       noActivityText: { fontSize: 14, color: '#666666', textAlign: 'center', paddingVertical: 20 },
       navContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
       navItem: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16 },
       navIcon: { fontSize: 24, marginBottom: 4 },
       navLabel: { fontSize: 12 },
     });