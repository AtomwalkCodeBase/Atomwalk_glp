import { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HeaderComponent from '../components/HeaderComponent';
import DetailHeader from '../components/DetailHeader';
import { ProjectContext } from '../../context/ProjectContext';

const TestList = () => {
  const { testsByProject, projectTitles, errors } = useContext(ProjectContext);
  const { ref_num } = useLocalSearchParams();
  const router = useRouter();
  const tests = testsByProject[ref_num] || [];
  const projectTitle = projectTitles[ref_num] || ref_num;
  const [expandedTests, setExpandedTests] = useState({});

  const frequencyLabels = {
    D: 'Daily',
    W: 'Weekly',
    O: 'One Time at the End',
    B: 'One Time Before Start',
    N: 'As per the Date schedule',
  };

  const toggleSubtypes = (testId) => {
    setExpandedTests(prev => ({
      ...prev,
      [testId]: !prev[testId]
    }));
  };

  const renderSubtypes = (test) => {
    if (!test.is_sub_type_applicable || !test.test_sub_type_list || test.test_sub_type_list.length === 0) {
      return null;
    }

    return (
      <View style={styles.subtypesContainer}>
        {test.test_sub_type_list.map((subtype, index) => (
          <View key={index} style={styles.subtypeItem}>
            <Text style={styles.subtypeName}>{subtype.test_sub_type}</Text>
            {subtype.test_unit && (
              <Text style={styles.subtypeUnit}>{subtype.test_unit}</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderComponent headerTitle="Test List" onBackPress={() => router.back()} />
      <DetailHeader 
        projectTitle={projectTitle}
        projectCode={ref_num}
      />
      
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
              <View key={test.id} style={styles.testCard}>
                <View style={styles.testHeader}>
                  <View style={styles.testNameContainer}>
                    <Text style={styles.testName}>{test.name}</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>
                        {test.test_category === 'L' ? 'Laboratory Data' : 'Clinical Observation Data'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.testDetails}>
                  <Text style={styles.frequencyText}>
                    Frequency: {frequencyLabels[test.test_frequency] || 'Unknown'}
                  </Text>
                  {test.test_unit && !test.is_sub_type_applicable && (
                    <Text style={styles.unitText}>Unit: {test.test_unit}</Text>
                  )}
                </View>

                {test.is_sub_type_applicable && test.test_sub_type_list?.length > 0 && (
                  <TouchableOpacity
                    style={styles.subtypeButton}
                    onPress={() => toggleSubtypes(test.id)}
                  >
                    <Text style={styles.subtypeButtonText}>
                      {test.test_sub_type_list.length} Subtypes
                    </Text>
                  </TouchableOpacity>
                )}

                {expandedTests[test.id] && renderSubtypes(test)}
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
    backgroundColor: '#f8fffe',
  },
  scrollView: {
    flex: 1,
  },
  testsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
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
    flexDirection: 'column',
    marginBottom: 12,
  },
  testNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: '#33B1AF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  testDetails: {
    marginBottom: 8,
  },
  frequencyText: {
    fontSize: 16,
    color: '#64748b',
  },
  unitText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  subtypeButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  subtypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  subtypesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  subtypeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  subtypeName: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  subtypeUnit: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#6c757d',
    textAlign: 'center',
  },
});

export default TestList;