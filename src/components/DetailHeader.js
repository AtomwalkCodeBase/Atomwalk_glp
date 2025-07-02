import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DetailHeader = ({
  projectTitle,
  testName,
  groupType,
  scheduleDate,
  completionStatus,
  speciesType,
  statusColors = {
    completed: '#4CAF50',
    pending: '#FF9800',
    default: '#9E9E9E'
  }
}) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return statusColors.completed;
      case 'pending': return statusColors.pending;
      default: return statusColors.default;
    }
  };

  const getStatusBackgroundColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return '#E8F5E9';
      case 'pending': return '#FFF3E0';
      default: return '#F5F5F5';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return '#2E7D32';
      case 'pending': return '#EF6C00';
      default: return '#424242';
    }
  };

  const completionPercentage = completionStatus?.totalCount > 0
    ? Math.round((completionStatus.completedCount / completionStatus.totalCount) * 100)
    : 0;

  return (
    <View style={[
      styles.container,
      completionStatus?.status && { borderLeftColor: getStatusColor(completionStatus.status) }
    ]}>
      {projectTitle && (
        <View style={styles.row}>
          <Text style={styles.label}>Project:</Text>
          <Text style={styles.value}>{projectTitle}</Text>
        </View>
      )}

      {testName && (
        <View style={styles.row}>
          <Text style={styles.label}>Test:</Text>
          <Text style={styles.value}>{testName}</Text>
        </View>
      )}

      {groupType && (
        <View style={styles.row}>
          <Text style={styles.label}>Group:</Text>
          <Text style={styles.value}>{groupType}</Text>
        </View>
      )}

      {speciesType && (
        <View style={styles.row}>
          <Text style={styles.label}>Species:</Text>
          <Text style={styles.value}>{speciesType}</Text>
        </View>
      )}

      {scheduleDate && (
        <View style={styles.row}>
          <Text style={styles.label}>Schedule Date:</Text>
          <Text style={styles.value}>
            {new Date(scheduleDate).toLocaleDateString()}
          </Text>
        </View>
      )}

      {completionStatus && (
        <View style={[styles.row, styles.completionRow]}>
          <View style={styles.completionTextContainer}>
            <Text style={styles.label}>Completion:</Text>
            <Text style={styles.value}>
              {`${completionStatus.completedCount}/${completionStatus.totalCount}`}
              {completionStatus.totalCount > 0 && (
                <Text style={{ color: '#2E7D32' }}>
                  {` (${completionPercentage}%)`}
                </Text>
              )}
            </Text>
          </View>
          
          <View style={[
            styles.statusBadge,
            { 
              backgroundColor: getStatusBackgroundColor(completionStatus.status),
              borderColor: getStatusColor(completionStatus.status),
              borderWidth: 1
            }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusTextColor(completionStatus.status) }
            ]}>
              {completionStatus.status}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 60,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  completionRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completionTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: '#444',
    fontWeight: 'bold',
    marginRight: 8,
  },
  value: {
    fontSize: 16,
    color: '#444',
    fontWeight: '500',
    flex: 1,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default DetailHeader;