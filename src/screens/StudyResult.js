import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import HeaderComponent from '../components/HeaderComponent';
import { ProjectContext } from '../../context/ProjectContext';
import DropdownPicker from '../components/DropdownPicker';
import TestCard from '../components/TestCard';
import { StyleSheet } from 'react-native';
import DatePicker from '../components/DatePicker';

const StudyResult = () => {
  const { ref_num, refresh } = useLocalSearchParams();
  const router = useRouter();
  const {
    projectTitles,
    groupsByProject,
    testsByProject,
    getTestsForDate,
    getCompletionStatus,
    getAnimalCounts,
    currentDate,
    setCurrentDate,
  } = useContext(ProjectContext);
  const projectTitle = projectTitles[ref_num] || ref_num;

  const groups = groupsByProject[ref_num] || [];
  const allTests = testsByProject[ref_num] || [];

  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedTest, setSelectedTest] = useState('All');
  const [selectedDate, setSelectedDate] = useState(null);
  const [groupedTests, setGroupedTests] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [animalCounts, setAnimalCounts] = useState({ totalAnimals: 0, completedAnimals: 0, pendingAnimals: 0 });

  useEffect(() => {
    if (!selectedDate && currentDate) {
      setSelectedDate(currentDate);
    }
  }, [currentDate]);

  const handleDateChange = (formattedDate) => {
    setSelectedDate(formattedDate);
    if (setCurrentDate) {
      setCurrentDate(formattedDate);
    }
  };

  const handleNavigation = useCallback((test) => {
    router.push({
      pathname: '/CaptureData',
      params: {
        ref_num,
        groupId: test.groupId,
        test: JSON.stringify(test),
        scheduleDate: test.scheduleDate, // Already in YYYY-MM-DD format
      },
    });
  }, [router, ref_num]);

  const fetchTests = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setFetchError(null);
    try {
      // Get tests for the selected date (already in YYYY-MM-DD format)
      const fetchedTests = getTestsForDate(ref_num, selectedDate);

      const filteredTests = fetchedTests.filter(test => {
        const matchesGroup = selectedGroup === 'All' || test.groupName === selectedGroup;
        const matchesTest = selectedTest === 'All' || test.name === selectedTest;
        return matchesGroup && matchesTest;
      });

      const testsWithCompletion = await Promise.all(
        filteredTests.map(async test => {
          const completion = await getCompletionStatus(
            ref_num,
            test.groupId,
            test.id,
            test.scheduleDate, // Already in YYYY-MM-DD format
            forceRefresh
          );
          return { ...test, completion };
        })
      );

      const counts = await getAnimalCounts(ref_num, selectedDate);
      setAnimalCounts(counts);

      const grouped = testsWithCompletion.reduce((acc, test) => {
        const { groupName } = test;
        if (!acc[groupName]) acc[groupName] = [];
        acc[groupName].push(test);
        return acc;
      }, {});

      setGroupedTests(grouped);
    } catch (err) {
      console.error('Error fetching tests:', err);
      setFetchError('Failed to load tests. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [ref_num, selectedDate, selectedTest, selectedGroup, getTestsForDate, getCompletionStatus, getAnimalCounts]);

  useFocusEffect(
    useCallback(() => {
      if (refresh === 'true') {
        fetchTests(true);
        router.setParams({ refresh: undefined });
      } else {
        fetchTests(false);
      }
      return () => { };
    }, [refresh, fetchTests, router])
  );

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return ''; // or return 'Invalid date' if you prefer

    // Parse the YYYY-MM-DD string to a Date object for display formatting
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <HeaderComponent headerTitle="Study Result" onBackPress={() => router.back()} />

      <View style={styles.sectionHeader}>
        <Text style={styles.projectName}>{`Project: ${projectTitle}`}</Text>

        <View style={styles.countsContainer}>
          <Text style={styles.countsText}>
            Total: {animalCounts.totalAnimals}
          </Text>
          <Text style={[styles.countsText, { color: '#4CAF50' }]}>
            Completed: {animalCounts.completedAnimals}
          </Text>
          <Text style={[styles.countsText, { color: '#FF9800' }]}>
            Pending: {animalCounts.pendingAnimals}
          </Text>
        </View>

        {/* Date Picker Section */}
        <View style={styles.datePickerContainer}>
          <DatePicker
            label="Select Date"
            cDate={selectedDate}
            setCDate={handleDateChange}
          />
        </View>

        <View style={styles.filterContainer}>
          <View style={styles.filterRow}>
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownLabel}>Select Group</Text>
              <DropdownPicker
                label="Group"
                data={[
                  { label: 'All', value: 'All' },
                  ...groups.map(group => ({
                    label: group.study_type,
                    value: group.study_type
                  })),
                ]}
                value={selectedGroup}
                setValue={setSelectedGroup}
              />
            </View>

            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownLabel}>Select Test</Text>
              <DropdownPicker
                label="Test"
                data={[
                  { label: 'All', value: 'All' },
                  ...[...new Set(allTests.map(test => test.name))].map(name => ({
                    label: name,
                    value: name
                  })),
                ]}
                value={selectedTest}
                setValue={setSelectedTest}
              />
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0288d1" />
            <Text style={styles.loadingText}>Loading tests...</Text>
          </View>
        ) : fetchError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{fetchError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchTests(true)}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : Object.keys(groupedTests).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {`No tests scheduled for ${formatDisplayDate(selectedDate)}`}
            </Text>
          </View>
        ) : (
          <View style={styles.testsContainer}>
            {Object.entries(groupedTests).map(([groupName, groupTests]) => (
              <View key={`group-${groupName}`} style={styles.groupSection}>
                <Text style={styles.groupName}>{`${groupTests[0]?.groupIdUser || 'ID'} [${groupName}]`}</Text>
                {groupTests.map(test => (
                  <TestCard
                    key={`test-${test.id}-${test.groupId}`}
                    test={test}
                    onPress={handleNavigation}
                    formatDisplayDate={formatDisplayDate}
                  />
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  sectionHeader: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  countsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    borderRadius: 6,
  },
  countsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  datePickerContainer: {
    marginBottom: 12,
  },
  filterContainer: {
    marginBottom: 6,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dropdownContainer: {
    flex: 1,
  },
  dropdownLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0288d1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  testsContainer: {
    padding: 16,
  },
  groupSection: {
    marginBottom: 24,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
    paddingLeft: 8,
  },
});

export default StudyResult;