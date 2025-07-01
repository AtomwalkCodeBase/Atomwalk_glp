import { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HeaderComponent from '../components/HeaderComponent';
import { ProjectContext } from '../../context/ProjectContext';

const TestList = () => {
  const { testsByProject, projectTitles, errors } = useContext(ProjectContext);
  const { ref_num } = useLocalSearchParams();
  const router = useRouter();
  const tests = testsByProject[ref_num] || [];
  const projectTitle = projectTitles[ref_num] || ref_num;

  const frequencyLabels = {
    D: 'Daily',
    W: 'Weekly',
    O: 'One Time at the End',
    B: 'One Time Before Start',
    N: 'As per the Date schedule',
  };

  // const handleTestClick = (test) => {
  //   console.log('Test clicked:', test);
  //   router.push({
  //     pathname: 'TestDetail',
  //     params: {
  //       ref_num,
  //       test: JSON.stringify(test),
  //     },
  //   });
  // };

  return (
    <View style={styles.container}>
      <HeaderComponent headerTitle="Test List" onBackPress={() => router.back()} />
      <View style={styles.sectionHeader}>
        <Text style={styles.projectName}>Project: {projectTitle}</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.testsContainer}>
          <Text style={styles.sectionTitle}>Tests Overview</Text>
          {errors[ref_num]?.tests ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, {color: 'red'}]}>{errors[ref_num].tests}</Text>
            </View>
          ) : tests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tests are available</Text>
            </View>
          ) : (
            tests.map((test) => (
              <View
                key={test.id}
                style={styles.testCard}
                // onPress={() => handleTestClick(test)}
              >
                <View style={styles.testHeader}>
                  <Text style={styles.testName}>{test.name}</Text>
                </View>
                <View style={styles.testDetails}>
                  <Text style={styles.frequencyText}>
                    Frequency: {frequencyLabels[test.test_frequency] || 'Unknown'}
                  </Text>
                </View>
              </View>
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
  testDetails: {
    marginBottom: 10,
  },
  frequencyText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 4,
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