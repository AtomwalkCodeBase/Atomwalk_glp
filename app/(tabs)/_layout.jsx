import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#088f8f',
        tabBarInactiveTintColor: '#939191',
        animationEnabled: true, // Enable animation
      }}
    >
      <Tabs.Screen name='home'
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />
        }} />
      <Tabs.Screen name='activity' options={{
        title: 'Activity',
        headerShown: false,
        tabBarIcon: ({ color }) => <Entypo name="lab-flask" size={24} color={color} />
      }}></Tabs.Screen>

      <Tabs.Screen name='booking' options={{
        title: 'My Bookings',
        headerShown: false,
        tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={24} color={color} />
      }}></Tabs.Screen>

      <Tabs.Screen name='profile' options={{
        title: 'Profile',
        headerShown: false,
        tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />
      }}></Tabs.Screen>
    </Tabs>
  )
}

export default _layout