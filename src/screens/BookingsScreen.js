import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { LabCard } from '../components/mycomponents/LabCard';
// import { LabCard } from '../components/LabCard';

export const BookingsScreen = ({ bookings, onEnterLab }) => (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="dark-content" backgroundColor="#c2fbcd" />
    
    <View style={styles.header}>
      <Text style={styles.headerTitle}>My Lab Bookings</Text>
      <Text style={styles.headerSubtitle}>Today's Schedule - {new Date().toLocaleDateString()}</Text>
    </View>

    <ScrollView 
      style={styles.content} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {bookings.map((booking) => (
        <LabCard
          key={booking.id}
          booking={booking}
          onEnterLab={onEnterLab}
        />
      ))}
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#c2fbcd',
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1a2e1a',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#2d5a3d',
    opacity: 0.9,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
});
