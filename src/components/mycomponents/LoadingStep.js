import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const LoadingStep = ({ step, isCompleted, isActive }) => {
  const Icon = step.icon;
  return (
    <View style={[
      styles.stepContainer,
      isActive && styles.stepContainerActive
    ]}>
      <View style={styles.stepIcon}>
        {isActive && !isCompleted ? (
          <ActivityIndicator size="small" color="#4a9960" style={styles.loader} />
        ) : isCompleted ? (
          <AntDesign name="checkcircleo" size={24} color="#2d5a3d" />
        ) : (
          <Icon name={step.iconName} size={24} color="#94a3b8" />
        )}
      </View>
      <Text style={[
        styles.stepText,
        isCompleted && styles.stepTextCompleted,
        isActive && styles.stepTextActive
      ]}>
        {step.text}
      </Text>
    </View>
  );
};

export default LoadingStep;

const styles = StyleSheet.create({
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepContainerActive: {
    backgroundColor: '#e8f5e8',
    borderWidth: 1,
    borderColor: '#4a9960',
  },
  stepIcon: {
    marginRight: 16,
    width: 24,
    alignItems: 'center',
  },
  loader: {
    marginRight: 16,
  },
  stepText: {
    fontSize: 18,
    color: '#6b7280',
    flex: 1,
    fontWeight: '500',
  },
  stepTextCompleted: {
    color: '#2d5a3d',
    fontWeight: '700',
  },
  stepTextActive: {
    color: '#4a9960',
    fontWeight: '600',
  },
});