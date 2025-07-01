import { View, Text, StyleSheet } from 'react-native';

const CaptureDataHeader = ({ 
  projectTitle, 
  testName, 
  groupType, 
  scheduleDate, 
  completionStatus 
}) => {
  // Color scheme matching TestCard
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#4CAF50'; 
      case 'Pending': return '#FF9800';  
      case 'Not Assigned': return '#F44336'; 
      default: return '#9E9E9E'
    }
  };

  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case 'Completed': return '#E8F5E9'; 
      case 'Pending': return '#FFF3E0';   
      case 'Not Assigned': return '#FFEBEE';
      default: return '#F5F5F5';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'Completed': return '#2E7D32'; 
      case 'Pending': return '#EF6C00';   
      case 'Not Assigned': return '#C62828'; 
      default: return '#424242';
    }
  };

  const completionPercentage = completionStatus.totalCount > 0
    ? Math.round((completionStatus.completedCount / completionStatus.totalCount) * 100)
    : 0;

  return (
    <View style={[
      styles.headerSection,
      { borderLeftColor: getStatusColor(completionStatus.status) }
    ]}>
      <Text style={styles.headerText}>
        <Text style={styles.label}>Project: </Text>{projectTitle}
      </Text>
      <Text style={styles.headerText}>
        <Text style={styles.label}>Test: </Text>{testName}
      </Text>
      <Text style={styles.headerText}>
        <Text style={styles.label}>Group: </Text>{groupType}
      </Text>
      <Text style={styles.headerText}>
        <Text style={styles.label}>Schedule Date: </Text>
        {new Date(scheduleDate).toLocaleDateString()}
      </Text>
      <View style={styles.completionStatus}>
        <Text style={styles.completionText}>
          <Text style={styles.label}>Completion: </Text>
          {`${completionStatus.completedCount}/${completionStatus.totalCount}`}
          {completionStatus.totalCount > 0 && (
            <Text style={{ color: '#2E7D32' }}>
              {` (${completionPercentage}%)`}
            </Text>
          )}
        </Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
    marginBottom: 2,
  },
  headerText: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 8,
    lineHeight: 20,
  },
  label: {
    fontWeight: '600',
    color: '#334155',
  },
  completionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingVertical: 8,
  },
  completionText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default CaptureDataHeader;