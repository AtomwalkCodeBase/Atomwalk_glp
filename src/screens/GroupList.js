import { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HeaderComponent from '../components/HeaderComponent';
import { ProjectContext } from '../../context/ProjectContext';

const GroupList = () => {
  const { groupsByProject, projectTitles, setSelectedGroup, errors } = useContext(ProjectContext);
  const { ref_num } = useLocalSearchParams();
  const router = useRouter();
  const groups = groupsByProject[ref_num] || [];
  const projectTitle = projectTitles[ref_num] || ref_num;

  const handleSelectGroup = (item) => {
    setSelectedGroup(item);
    router.push({
      pathname: 'AnimalDetails',
      params: {
        projectTitle,
        groupId: item.group_id,
        groupName: item.study_type,
        ref_num,
      },
    });
  };

  const getSpeciesType = () => {
    if (!groups || groups.length === 0 || !groups[0].species_type) return 'Unknown';

    switch (groups[0].species_type) {
      case 'R':
        return 'Rat';
      case 'P':
        return 'Pig';
      default:
        return 'Unknown';
    }
  };

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => handleSelectGroup(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.groupName}>{item.study_type || 'Unknown'}</Text>
        {/* <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusBgColor(item.status) }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(item.status) }
          ]}>
            {item.status}
          </Text>
        </View> */}
      </View>

      {/* <View style={styles.cardContent}>
        <View style={styles.testInfo}>
          <Text style={styles.testCount}>{item.total_tests}</Text>
          <Text style={styles.testLabel}>Total Tests</Text>
        </View>

        <View style={styles.testInfo}>
          <Text style={styles.testCount}>{item.completed_tests}</Text>
          <Text style={styles.testLabel}>Completed</Text>
        </View>

        <View style={styles.testInfo}>
          <Text style={styles.testCount}>{item.total_tests - item.completed_tests}</Text>
          <Text style={styles.testLabel}>Remaining</Text>
        </View>
      </View> */}

      {/* Progress bar */}
      {/* <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(item.completed_tests / item.total_tests) * 100}%`,
                backgroundColor: getStatusColor(item.status)
              }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round((item.completed_tests / item.total_tests) * 100)}%
        </Text>
      </View> */}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <HeaderComponent headerTitle="Groups List" onBackPress={() => router.back()} />
      <View style={styles.sectionHeader}>
        <View style={styles.labelValueContainer}>
          <Text style={styles.label}>Project:</Text>
          <Text style={styles.value}>{projectTitle}</Text>
        </View>
        {groups.length > 0 && (
          <Text style={styles.projectHeader}>Species: {getSpeciesType()}</Text>
        )}
      </View>

      {errors[ref_num]?.groups ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: 'red' }]}>
            {errors[ref_num].groups}
          </Text>
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No groups are available</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.group_id}
          renderItem={renderGroupItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  sectionHeader: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  projectHeader: {
    fontSize: 16,
    color: '#444',
    marginBottom: 4,
  },
  labelValueContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    color: '#444',
    width: 60,
  },
  value: {
    fontSize: 16,
    color: '#444',
    flex: 1,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
  },
  listContainer: {
    padding: 16,
  },
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  testInfo: {
    alignItems: 'center',
  },
  testCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
  },
  testLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#343a40',
    minWidth: 40,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#6c757d',
    textAlign: 'center',
  },
});

export default GroupList;