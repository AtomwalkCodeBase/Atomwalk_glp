import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';

export const ActivityCard = ({ activity, onEnterLab }) => (
  <Card style={styles.activityCard}>
    <View style={styles.activityHeader}>
      <Text style={styles.activityName}>{activity.name}</Text>
      <View style={styles.timeContainer}>
        <AntDesign name="clockcircleo" size={20} color="#6b7280" />
        <Text style={styles.activityTime}>{activity.time}</Text>
      </View>
    </View>

    <Text style={styles.equipmentLabel}>Equipment Required:</Text>
    <View style={styles.equipmentContainer}>
      {activity.equipment.map((item, index) => (
        <Badge 
          key={index} 
          text={item} 
          icon={Ionicons} 
          iconName="construct-outline"
        />
      ))}
    </View>

    <Button 
      title="🚪 Enter Lab" 
      onPress={() => onEnterLab(activity)}
      style={styles.enterButton}
    />
  </Card>
);

const styles = StyleSheet.create({
  activityCard: {
    backgroundColor: '#f8faff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  activityTime: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  equipmentLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  equipmentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  enterButton: {
    marginTop: 8,
  },
});