import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function UserDashboard() {
  const [dashboardData, setDashboardData] = useState({
    moodStats: [],
    healCoinBalance: 0,
    streak: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        const [dashboardRes, healcoinRes] = await Promise.all([
          axios.get('http://192.168.0.106:5000/api/dashboard/user', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://192.168.0.106:5000/api/healcoin/balance', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setDashboardData({
          moodStats: dashboardRes.data.moodStats || [],
          healCoinBalance: healcoinRes.data.healCoins || 0,
          streak: dashboardRes.data.missionsCompleted || 0,
        });
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <View className="p-4 bg-white rounded-lg shadow mb-4">
      <Text className="text-lg font-bold mb-2">Your Dashboard</Text>
      <Text className="text-gray-600">Mood Trend: {dashboardData.moodStats.length > 0 ? dashboardData.moodStats[0]._id : 'Neutral'}</Text>
      <Text className="text-gray-600">Missions Completed: {dashboardData.streak}</Text>
      <Text className="text-gray-600">HealCoin Balance: {dashboardData.healCoinBalance}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FAFAFA' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 20, color: '#1F2937' },
  section: { fontSize: 18, fontWeight: '600', marginVertical: 10, color: '#1F2937' },
  item: { fontSize: 16, color: '#4B5563' },
});