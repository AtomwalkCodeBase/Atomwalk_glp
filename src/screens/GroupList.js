import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HeaderComponent from '../components/HeaderComponent';
import { getGLPGroupList } from '../services/productServices';

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const { ref_num } = useLocalSearchParams();
  const router = useRouter();
  const [projectTitle, setProjectTitle] = useState('');

  // Hardcoded data for now - replace with API call later
  const hardcodedGroups = [
    {
      group_id: '1',
      name: 'Group1',
      total_tests: 5,
      completed_tests: 5,
      status: 'Completed'
    },
    {
      group_id: '2',
      name: 'Group2',
      total_tests: 5,
      completed_tests: 2,
      status: 'Pending'
    },
    {
      group_id: '3',
      name: 'Group3',
      total_tests: 5,
      completed_tests: 0,
      status: 'Not Started'
    },
    {
      group_id: '4',
      name: 'Group3',
      total_tests: 5,
      completed_tests: 0,
      status: 'Not Started'
    },
    {
      group_id: '5',
      name: 'Group3',
      total_tests: 5,
      completed_tests: 0,
      status: 'Not Started'
    },
  ];

  useEffect(() => {
    // TODO: Replace with actual API call
    // fetchGroupsByProject(ref_num)
    //   .then((res) => {
    //     setGroups(res.data.groups);
    //   })
    //   .catch((err) => console.error('Error fetching groups', err));

    // For now, use hardcoded data
    fetchGroupList();
    // setGroups(hardcodedGroups);
  }, [ref_num]);

  const fetchGroupList = async () => {
    try {
      const response = await getGLPGroupList(ref_num);
      if (response.status === 200) {
        const data = response.data;
        setGroups(data);
        setProjectTitle(data[0].project_title || 'Project Title');

      }
    }
    catch (error) {
      console.error('Error fetching group list:', error);
    }
  }

  const handleSelectGroup = (item) => {
    // Navigate to test list or detail page
    router.push({
      pathname: 'TestList', // or whatever your next page is called
      params: {
        ref_num,
        group: JSON.stringify(item)
      },
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#28a745'; // Green
      case 'Pending':
        return '#ffc107'; // Yellow/Orange
      case 'Not Started':
        return '#dc3545'; // Red
      default:
        return '#6c757d'; // Gray
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#d4edda'; // Light green
      case 'Pending':
        return '#fff3cd'; // Light yellow
      case 'Not Started':
        return '#f8d7da'; // Light red
      default:
        return '#e9ecef'; // Light gray
    }
  };

  const getSpeciesType = () => {
    if (!groups || groups.length === 0 || !groups[0].species_type) return 'Unknown';

    switch (groups[0].species_type) {
      case "R":
        return 'Rat';
      case "P":
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
        <Text style={styles.groupName}>{item.name}</Text>
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
      </View>  */}
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

        {/* <Text style={styles.pageTitle}>Select Groups</Text> */}
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.group_id}
        renderItem={renderGroupItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
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
    color: '#6c757d',
    marginBottom: 4,
  },
  labelValueContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    color: '#6c757d',
    width: 60, // fixed width to align wrapped lines
  },
  value: {
    fontSize: 16,
    color: '#6c757d',
    flex: 1, // take remaining space and wrap under the label
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
});

export default GroupList;