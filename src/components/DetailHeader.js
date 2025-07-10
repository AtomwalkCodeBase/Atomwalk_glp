import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DetailHeader = ({
  projectTitle,
  projectCode,
  groupType,
  testName,
  doseDetail,
  scheduleDate,
  completionStatus,
  speciesType,
  animalCounts,
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

  const InfoChip = ({ label, value, icon }) => (
    <View style={styles.infoChip}>
      {icon && <Text style={styles.chipIcon}>{icon}</Text>}
      <Text style={styles.chipLabel}>{label}:</Text>
      <Text style={styles.chipValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Project Title Row */}
      {projectTitle && (
        <View style={styles.titleRow}>
          <Text style={styles.titleLabel}>Project:</Text>
          <Text style={styles.titleValue}>{projectTitle}</Text>
        </View>
      )}
      {projectCode && (
        <View style={styles.titleRow}>
          <Text style={styles.codeLabel}>Code:</Text>
          <Text style={styles.codeValue}>{projectCode}</Text>
        </View>
      )}

      {animalCounts && (
        <View style={styles.countsContainer}>
          <View style={styles.countsLabelsRow}>
            <Text style={[styles.countLabel, { color: '#2196F3' }]}>Total</Text>
            <Text style={[styles.countLabel, { color: '#2E7D32' }]}>Completed</Text>
            <Text style={[styles.countLabel, { color: '#EF6C00' }]}>Pending</Text>
          </View>
          <View style={styles.countsValuesRow}>
            <View style={[styles.countValueContainer, { backgroundColor: '#E3F2FD' }]}>
              <Text style={[styles.countValue, { color: '#1565C0' }]}>
                {animalCounts.totalAnimals || 0}
              </Text>
            </View>
            <View style={[styles.countValueContainer, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.countValue, { color: '#2E7D32' }]}>
                {animalCounts.completedAnimals || 0}
              </Text>
            </View>
            <View style={[styles.countValueContainer, { backgroundColor: '#FFF3E0' }]}>
              <Text style={[styles.countValue, { color: '#EF6C00' }]}>
                {animalCounts.pendingAnimals || 0}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Info Chips */}
      <View style={styles.chipsContainer}>
        {testName && (
          <InfoChip label="Test" value={testName} />
        )}
        {groupType && (
          <InfoChip label="Group" value={groupType} />
        )}
        {doseDetail && (
          <InfoChip label="Dose" value={doseDetail} icon="💊" />
        )}
        {speciesType && (
          <InfoChip label="Species" value={speciesType} />
        )}
        {scheduleDate && (
          <InfoChip 
            label="Scheduled" 
            value={new Date(scheduleDate).toLocaleDateString()} 
            icon={<Ionicons name="calendar-outline" size={16} color="#64748b"/>} 
          />
        )}
      </View>

      {/* Completion Status */}
      {completionStatus && (
        <View style={styles.completionRow}>
          <View style={styles.completionTextContainer}>
            <Text style={styles.completionLabel}>Completion:</Text>
            <Text style={styles.completionValue}>
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
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 60,
  },
  
  // Title Row
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  titleLabel: {
    fontSize: 16,
    color: '#222',
    fontWeight: '600',
    marginRight: 8,
  },
  titleValue: {
    fontSize: 16,
    color: '#222',
    fontWeight: '600',
    flex: 1,
  },

  codeLabel: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
    marginRight: 8,
  },
  codeValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
    flex: 1,
  },
  
  // Counts Section
  countsContainer: {
    marginBottom: 12,
  },
  countsLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  countsValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  countLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  countValueContainer: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Info Chips
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fffe',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e8f8f7',
  },
  chipIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#718096',
    marginRight: 2,
  },
  chipValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
  },
  
  // Completion Row
  completionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e8f8f7',
  },
  completionTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  completionLabel: {
    fontSize: 16,
    color: '#444',
    fontWeight: 'bold',
    marginRight: 8,
  },
  completionValue: {
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