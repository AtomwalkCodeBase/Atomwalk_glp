import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TestCard = ({ test, selectedTab, onPress, formatDisplayDate }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#4CAF50';
      case 'Pending': return '#FF9800';
      case 'Not Assigned': return '#ef4444';
      default: return '#9E9E9E';
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
          opacity: selectedTab === 'Today' ? 1 : 0.7
        }
      ]}
      onPress={() => selectedTab === 'Today' && test.completion.status !== 'Not Assigned' && onPress(test)}
      activeOpacity={selectedTab === 'Today' && test.completion.status !== 'Not Assigned' ? 0.7 : 1}
    >
      <View style={styles.testHeader}>
        <Text style={styles.testName}>{test.name}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(test.completion.status) }
        ]}>
          <Text style={styles.statusText}>
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
          <Text style={styles.detailText}>
            {`${test.completion.completedCount}/${test.completion.totalCount} Completed`}
            {test.completion.completedCount > 0 && (
              <Text style={{ color: '#4CAF50' }}>
                {` (${completionPercentage}%)`}
              </Text>
            )}
          </Text>
        ) : (
          <Text style={[styles.detailText, { color: '#ef4444' }]}>
            {`No ${test.completion.animalName}s assigned to this group`}
          </Text>
        )}
      </View>

      {selectedTab !== 'Today' && (
        <Text style={styles.viewOnlyText}>
          {`View only - cannot capture data for ${selectedTab.toLowerCase()}`}
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
    color: 'white',
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
    color: '#ef4444',
    fontStyle: 'italic',
  },
});

export default TestCard;