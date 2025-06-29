import React from 'react';
import { View, Text } from 'react-native';

export default function UserDashboard() {
  return (
    <View className="p-4 bg-white rounded-lg shadow mb-4">
      <Text className="text-lg font-bold mb-2">Your Dashboard</Text>
      <Text className="text-gray-600">Mood Trend: Neutral</Text>
      <Text className="text-gray-600">Missions Completed: 0</Text>
      <Text className="text-gray-600">HealCoin Balance: 0</Text>
    </View>
  );
}