import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Badge = ({ text, icon: Icon, iconName }) => (
  <View style={styles.badge}>
    {Icon && iconName && <Icon name={iconName} size={14} color="#2d5a3d" />}
    <Text style={styles.badgeText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 14,
    color: '#2d5a3d',
    fontWeight: '600',
  },
});