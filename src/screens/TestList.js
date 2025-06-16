import { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HeaderComponent from '../components/HeaderComponent';
import { ProjectContext } from '../../context/ProjectContext'

const TestList = () => {
  const { testsByProject, selectedProjectRef } = useContext(ProjectContext);
  const { ref_num, group } = useLocalSearchParams();
  const tests = testsByProject[ref_num] || [];
  const router = useRouter();
  const groupData = JSON.parse(group);

  // console.log('Tests:', tests);
  // Updated rat data with 10 rats (5 male, 5 female)
  // const ratData = [
  //   { id: 'R1', gender: 'Male', completed: true },
  //   { id: 'R2', gender: 'Male', completed: true },
  //   { id: 'R3', gender: 'Male', completed: false },
  //   { id: 'R4', gender: 'Male', completed: false },
  //   { id: 'R5', gender: 'Male', completed: true },
  //   { id: 'R6', gender: 'Female', completed: true },
  //   { id: 'R7', gender: 'Female', completed: false },
  //   { id: 'R8', gender: 'Female', completed: true },
  //   { id: 'R9', gender: 'Female', completed: false },
  //   { id: 'R10', gender: 'Female', completed: true }
  // ];

  // Function to calculate completion count for each test
  // const getCompletionCount = () => {
  //   return ratData.filter(rat => rat.completed).length;
  // };

  // const totalRats = ratData.length;
  // const completedCount = getCompletionCount();

  // Sample data with dynamic completion counts

  const projectData = {
    // tests: [
    //   {
    //     id: 1,
    //     name: "Blood Chemistry Analysis",
    //     frequency: 'D',
    //     status: completedCount === totalRats ? 'Completed' : completedCount > 0 ? 'In Progress' : 'Not Started',
    //     completedCount: completedCount,
    //     totalCount: totalRats
    //   },
    //   {
    //     id: 2,
    //     name: "Histopathology Examination",
    //     frequency: 'W',
    //     status: completedCount === totalRats ? 'Completed' : completedCount > 0 ? 'In Progress' : 'Pending',
    //     completedCount: completedCount,
    //     totalCount: totalRats
    //   },
    //   {
    //     id: 3,
    //     name: "Initial Health Assessment",
    //     frequency: 'B',
    //     status: completedCount === totalRats ? 'Completed' : completedCount > 0 ? 'In Progress' : 'Not Started',
    //     completedCount: completedCount,
    //     totalCount: totalRats
    //   },
    //   {
    //     id: 4,
    //     name: "Final Necropsy",
    //     frequency: 'O',
    //     status: 'Not Started',
    //     completedCount: 0,
    //     totalCount: totalRats
    //   },
    //   {
    //     id: 5,
    //     name: "Behavioral Observation",
    //     frequency: 'N',
    //     status: completedCount === totalRats ? 'Completed' : completedCount > 0 ? 'In Progress' : 'Not Started',
    //     completedCount: completedCount,
    //     totalCount: totalRats
    //   }
    // ]
  };

  const frequencyLabels = {
    'D': 'Daily',
    'W': 'Weekly',
    'O': 'One Time at the End',
    'B': 'One Time Before Start',
    'N': 'As per the Date schedule'
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#22c55e';
      case 'In Progress': return '#f59e0b';
      case 'Pending': return '#6b7280';
      case 'Not Started': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const handleTestClick = (test) => {
    router.push({
      pathname: 'TestDetail',
      params: {
        ref_num,
        group: JSON.stringify(groupData),
        test: JSON.stringify(test)
      }
    });
  };

  return (
    <View style={styles.container}>
      <HeaderComponent headerTitle="Test List" onBackPress={() => router.back()} />
      <View style={styles.sectionHeader}>
        <Text style={styles.projectName}>Project: {ref_num}</Text>
        <Text style={styles.groupName}>Group: {groupData.name}</Text>
      </View>
      <ScrollView style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Tests Section */}
        <View style={styles.testsContainer}>
          <Text style={styles.sectionTitle}>Tests Overview</Text>
          {tests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tests are available</Text>
            </View>
          ) : (
            tests.map((test) => (
              <TouchableOpacity
                key={test.id}
                style={styles.testCard}
                onPress={() => handleTestClick(test)}
              >
                <View style={styles.testHeader}>
                  <Text style={styles.testName}>{test.name}</Text>
                  {/* <View style={[styles.statusBadge, { backgroundColor: getStatusColor(test.status) }]}>
                  <Text style={styles.statusText}>{test.status}</Text>
                </View> */}
                </View>
                <View style={styles.testDetails}>
                  <Text style={styles.frequencyText}>
                    Frequency: {frequencyLabels[test.test_frequency]}
                  </Text>
                  <Text style={styles.progressText}>
                    Progress: {!test.completedCount && !test.totalCount
                      ? 'Not Started'
                      : `${test.completedCount}/${test.totalCount} completed`}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: !test.completedCount && !test.totalCount
                          ? '0%'
                          : `${(test.completedCount / test.totalCount) * 100}%`
                      }]}
                  />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>


      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  projectName: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 4,
  },
  groupName: {
    fontSize: 16,
    color: '#64748b',
  },
  testsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  testCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  testName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 10,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  testDetails: {
    marginBottom: 10,
  },
  frequencyText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 16,
    color: '#64748b',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  emptyContainer: {
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

export default TestList;