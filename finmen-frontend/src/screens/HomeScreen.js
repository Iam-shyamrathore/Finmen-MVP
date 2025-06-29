import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

// Import your components
import MoodTracker from '../components/MoodTracker/MoodTracker';
import ChatbotInterface from '../components/Chatbot/ChatbotInterface';
import MissionList from '../components/Missions/MissionList';
import UserDashboard from '../components/Dashboard/UserDashboard';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userName, setUserName] = useState('User');
  const navigation = useNavigation();

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('jwtToken');
      // Get user name from storage if available
      const name = await AsyncStorage.getItem('userName');
      if (name) setUserName(name);
      console.log('Stored token:', token);
    };
    checkToken();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'mood':
        return <MoodTracker />;
      case 'chat':
        return <ChatbotInterface />;
      case 'finance':
        return <MissionList />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Welcome Section */}
      <Animatable.View animation="fadeInDown" duration={800} style={{ marginBottom: 32 }}>
        <Text style={{
          fontSize: 16,
          color: '#666666',
          fontWeight: '400',
          marginBottom: 4
        }}>
          Welcome back,
        </Text>
        <Text style={{
          fontSize: 28,
          fontWeight: '300',
          color: '#000000',
          letterSpacing: 0.5
        }}>
          {userName}
        </Text>
      </Animatable.View>

      {/* Quick Stats */}
      <Animatable.View animation="fadeInUp" duration={600} delay={200}>
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 3
        }}>
          <UserDashboard />
        </View>
      </Animatable.View>

      {/* Quick Access Cards */}
      <Animatable.View animation="fadeInUp" duration={600} delay={400}>
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: '#000000',
          marginBottom: 16
        }}>
          Quick Access
        </Text>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 24
        }}>
          {/* Mood Tracker Card */}
          <TouchableOpacity
            onPress={() => setActiveTab('mood')}
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 20,
              marginRight: 8,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3
            }}
          >
            <View style={{
              width: 48,
              height: 48,
              backgroundColor: '#FEF3C7',
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12
            }}>
              <Text style={{ fontSize: 24 }}>😊</Text>
            </View>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#000000',
              textAlign: 'center'
            }}>
              Mood Tracker
            </Text>
            <Text style={{
              fontSize: 12,
              color: '#666666',
              textAlign: 'center',
              marginTop: 4
            }}>
              Track daily mood
            </Text>
          </TouchableOpacity>

          {/* Chat Card */}
          <TouchableOpacity
            onPress={() => setActiveTab('chat')}
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 20,
              marginHorizontal: 4,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3
            }}
          >
            <View style={{
              width: 48,
              height: 48,
              backgroundColor: '#DBEAFE',
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12
            }}>
              <Text style={{ fontSize: 24 }}>💬</Text>
            </View>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#000000',
              textAlign: 'center'
            }}>
              AI Chat
            </Text>
            <Text style={{
              fontSize: 12,
              color: '#666666',
              textAlign: 'center',
              marginTop: 4
            }}>
              Get support
            </Text>
          </TouchableOpacity>

          {/* Finance Card */}
          <TouchableOpacity
            onPress={() => setActiveTab('finance')}
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 20,
              marginLeft: 8,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3
            }}
          >
            <View style={{
              width: 48,
              height: 48,
              backgroundColor: '#D1FAE5',
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12
            }}>
              <Text style={{ fontSize: 24 }}>💰</Text>
            </View>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#000000',
              textAlign: 'center'
            }}>
              Finance
            </Text>
            <Text style={{
              fontSize: 12,
              color: '#666666',
              textAlign: 'center',
              marginTop: 4
            }}>
              Manage money
            </Text>
          </TouchableOpacity>
        </View>
      </Animatable.View>

      {/* Recent Activity */}
      <Animatable.View animation="fadeInUp" duration={600} delay={600}>
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: '#000000',
          marginBottom: 16
        }}>
          Recent Activity
        </Text>

        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 3
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#F3F4F6'
          }}>
            <View>
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: '#000000'
              }}>
                Mood Check-in
              </Text>
              <Text style={{
                fontSize: 12,
                color: '#666666'
              }}>
                2 hours ago
              </Text>
            </View>
            <Text style={{ fontSize: 20 }}>😊</Text>
          </View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#F3F4F6'
          }}>
            <View>
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: '#000000'
              }}>
                AI Chat Session
              </Text>
              <Text style={{
                fontSize: 12,
                color: '#666666'
              }}>
                Yesterday
              </Text>
            </View>
            <Text style={{ fontSize: 20 }}>💬</Text>
          </View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12
          }}>
            <View>
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: '#000000'
              }}>
                Budget Updated
              </Text>
              <Text style={{
                fontSize: 12,
                color: '#666666'
              }}>
                3 days ago
              </Text>
            </View>
            <Text style={{ fontSize: 20 }}>📊</Text>
          </View>
        </View>
      </Animatable.View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View style={{
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8
      }}>
        {activeTab !== 'dashboard' && (
          <TouchableOpacity
            onPress={() => setActiveTab('dashboard')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16
            }}
          >
            <Text style={{
              fontSize: 16,
              color: '#666666',
              marginRight: 8
            }}>
              ←
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#666666',
              fontWeight: '500'
            }}>
              Back to Dashboard
            </Text>
          </TouchableOpacity>
        )}

        {activeTab === 'dashboard' && (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <View style={{
              width: 40,
              height: 40,
              backgroundColor: '#000000',
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: '600'
              }}>F</Text>
            </View>

            <TouchableOpacity style={{
              width: 40,
              height: 40,
              backgroundColor: '#F3F4F6',
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: 20 }}>⚙️</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        {activeTab !== 'dashboard' ? (
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 20,
            flex: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3
          }}>
            {renderContent()}
          </View>
        ) : (
          renderContent()
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={{
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingVertical: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6'
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center'
        }}>
          <TouchableOpacity
            onPress={() => setActiveTab('dashboard')}
            style={{
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 16
            }}
          >
            <Text style={{
              fontSize: 24,
              marginBottom: 4,
              opacity: activeTab === 'dashboard' ? 1 : 0.5
            }}>🏠</Text>
            <Text style={{
              fontSize: 12,
              color: activeTab === 'dashboard' ? '#000000' : '#666666',
              fontWeight: activeTab === 'dashboard' ? '600' : '400'
            }}>
              Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('mood')}
            style={{
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 16
            }}
          >
            <Text style={{
              fontSize: 24,
              marginBottom: 4,
              opacity: activeTab === 'mood' ? 1 : 0.5
            }}>😊</Text>
            <Text style={{
              fontSize: 12,
              color: activeTab === 'mood' ? '#000000' : '#666666',
              fontWeight: activeTab === 'mood' ? '600' : '400'
            }}>
              Mood
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('chat')}
            style={{
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 16
            }}
          >
            <Text style={{
              fontSize: 24,
              marginBottom: 4,
              opacity: activeTab === 'chat' ? 1 : 0.5
            }}>💬</Text>
            <Text style={{
              fontSize: 12,
              color: activeTab === 'chat' ? '#000000' : '#666666',
              fontWeight: activeTab === 'chat' ? '600' : '400'
            }}>
              Chat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('finance')}
            style={{
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 16
            }}
          >
            <Text style={{
              fontSize: 24,
              marginBottom: 4,
              opacity: activeTab === 'finance' ? 1 : 0.5
            }}>💰</Text>
            <Text style={{
              fontSize: 12,
              color: activeTab === 'finance' ? '#000000' : '#666666',
              fontWeight: activeTab === 'finance' ? '600' : '400'
            }}>
              Finance
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}