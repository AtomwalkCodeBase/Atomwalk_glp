import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CircleButton } from '../components/old_components/Button';

const TestCard = ({ test, onPress, formatDisplayDate }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#4CAF50'; // Approved - Green
      case 'Pending': return '#FF9800';  // Back to claimant - Orange
      case 'Not Assigned': return '#F44336'; // Rejected - Red
      default: return '#9E9E9E'; // Default - Gray
    }
  };

  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case 'Completed': return '#E8F5E9'; // Approved - Light Green
      case 'Pending': return '#FFF3E0';   // Back to claimant - Light Orange
      case 'Not Assigned': return '#FFEBEE'; // Rejected - Light Red
      default: return '#F5F5F5'; // Default - Light Gray
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'Completed': return '#2E7D32'; // Approved - Dark Green
      case 'Pending': return '#EF6C00';   // Back to claimant - Dark Orange
      case 'Not Assigned': return '#C62828'; // Rejected - Dark Red
      default: return '#424242'; // Default - Dark Gray
    }
  };

  const completionPercentage = test.completion.totalCount > 0
    ? Math.round((test.completion.completedCount / test.completion.totalCount) * 100)
    : 0;

  return (
    <TouchableOpacity
      style={[
        styles.testCard,
        {
          borderLeftColor: getStatusColor(test.completion.status),
        }
      ]}
      onPress={() => test.completion.status !== 'Not Assigned' && onPress(test)}
      activeOpacity={test.completion.status !== 'Not Assigned' ? 0.7 : 1}
    >
      <View style={styles.testHeader}>
        <Text style={styles.testName}>{test.name}</Text>
        <View style={[
          styles.statusBadge,
          {
            backgroundColor: getStatusBackgroundColor(test.completion.status),
            borderColor: getStatusColor(test.completion.status),
            borderWidth: 1
          }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusTextColor(test.completion.status) }
          ]}>
            {test.completion.status}
          </Text>
        </View>
      </View>

      <View style={styles.testDetails}>
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Date: </Text>
          {formatDisplayDate(test.scheduleDate)}
        </Text>

        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Frequency: </Text>
          {test.frequencyLabel}
        </Text>

        {test.completion.totalCount > 0 ? (
          <View style={styles.inlineRow}>
            <Text style={styles.detailText}>
              {`${test.completion.completedCount}/${test.completion.totalCount} Completed`}
              {test.completion.completedCount > 0 && (
                <Text style={{ color: '#2E7D32' }}>
                  {` (${completionPercentage}%)`}
                </Text>
              )}
            </Text>
            <CircleButton 
              style={styles.inlineButton} 
              text="Capture Data"
              backgroundColor='#088f8f'
              handlePress={() => onPress(test)}
            />
          </View>

        ) : (
          <Text style={[styles.detailText, { color: '#C62828' }]}> {/* Dark Red */}
            {`No ${test.completion.animalName}s assigned to this group`}
          </Text>
        )}
      </View>

      {test.completion.status === 'Not Assigned' && (
        <Text style={styles.viewOnlyText}>
          Cannot capture data - no animals assigned
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  testCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flexShrink: 1,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  testDetails: {
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#475569',
  },
  detailLabel: {
    fontWeight: '600',
    color: '#334155',
  },
  viewOnlyText: {
    marginTop: 8,
    fontSize: 12,
    color: '#C62828',
    fontStyle: 'italic',
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inlineButton: {
    marginLeft: 8,
    width: 120,
    borderRadius: 10,
    height: 30
  },
});

export default TestCard;