import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Badge } from './Badge';
import { ActivityCard } from './ActivityCard';

export const LabCard = ({ booking, onEnterLab }) => (
  <Card style={styles.labCard}>
    <View style={styles.labHeader}>
      <View style={styles.labTitleContainer}>
        <View style={styles.labIcon}>
          <Ionicons name="beaker-outline" size={28} color="#2d5a3d" />
        </View>
        <View>
          <Text style={styles.labTitle}>{booking.labName}</Text>
          <Text style={styles.labSubtitle}>Laboratory</Text>
        </View>
      </View>
      <Badge 
        text={`${booking.activities.length} activities`} 
        icon={Ionicons} 
        iconName="flask-outline"
      />
    </View>

    <View style={styles.activitiesContainer}>
      {booking.activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onEnterLab={onEnterLab}
        />
      ))}
    </View>
  </Card>
);

const styles = StyleSheet.create({
  labCard: {
    borderLeftWidth: 6,
    borderLeftColor: '#4a9960',
  },
  labHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  labTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  labIcon: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 16,
  },
  labTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
  },
  labSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 2,
  },
  activitiesContainer: {
    gap: 4,
  },
});