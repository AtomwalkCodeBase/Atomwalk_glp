import { useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import HeaderComponent from '../components/HeaderComponent';
import DetailHeader from '../components/DetailHeader';
import { ProjectContext } from '../../context/ProjectContext';
import TestCard from '../components/TestCard';
import { StyleSheet } from 'react-native';
import FilterModal from '../components/StudyResultFilterModal';

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
    projectDates,
  } = useContext(ProjectContext);

  const projectTitle = projectTitles[ref_num] || ref_num;

  const groups = groupsByProject[ref_num] || [];
  const allTests = testsByProject[ref_num] || [];

  // Get project-specific dates or fallback to current date
  const projectDateInfo = projectDates[ref_num] || {};
  const projectStartDate = projectDateInfo.startDate || currentDate;
  const projectEndDate = projectDateInfo.endDate || addDays(currentDate, 30);

  const [filters, setFilters] = useState({
    startDate: currentDate || new Date().toISOString().split('T')[0],
    group: 'All',
    test: 'All',
  });
  const [groupedTests, setGroupedTests] = useState({});
  const [filteredTests, setFilteredTests] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [animalCounts, setAnimalCounts] = useState({ totalAnimals: 0, completedAnimals: 0, pendingAnimals: 0 });
  const [showFilterModal, setShowFilterModal] = useState(false);

  const handleNavigation = useCallback(
    (test) => {
      router.push({
        pathname: '/CaptureData',
        params: {
          ref_num,
          groupId: test.groupId,
          test: JSON.stringify(test),
          scheduleDate: test.scheduleDate,
        },
      });
    },
    [router, ref_num]
  );

  const fetchTests = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      setFetchError(null);
      try {
        const fetchedTests = getTestsForDate(ref_num, filters.startDate);

        // Enhance tests with completion status
        const testsWithCompletion = await Promise.all(
          fetchedTests.map(async (test) => {
            const completion = await getCompletionStatus(
              ref_num,
              test.groupId,
              test.id,
              test.scheduleDate,
              forceRefresh
            );
            return { 
              ...test, 
              completion,
              projectStartDate,
              projectEndDate
            };
          })
        );

        const counts = await getAnimalCounts(ref_num, filters.startDate);
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
    },
    [ref_num, filters.startDate, getTestsForDate, getCompletionStatus, getAnimalCounts, projectStartDate, projectEndDate]
  );

  useFocusEffect(
    useCallback(() => {
      if (refresh === 'true') {
        fetchTests(true);
        router.setParams({ refresh: undefined });
      } else {
        fetchTests(false);
      }
      return () => {};
    }, [refresh, fetchTests, router])
  );

  useEffect(() => {
    let filtered = { ...groupedTests };

    if (filters.group !== 'All') {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([groupName]) => groupName === filters.group)
      );
    }

    if (filters.test !== 'All') {
      filtered = Object.fromEntries(
        Object.entries(filtered).map(([groupName, tests]) => [
          groupName,
          tests.filter((test) => test.name === filters.test),
        ])
      );
      filtered = Object.fromEntries(Object.entries(filtered).filter(([_, tests]) => tests.length > 0));
    }

    setFilteredTests(filtered);
  }, [groupedTests, filters]);

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const clearFilters = () => {
    setFilters({
      startDate: currentDate || new Date().toISOString().split('T')[0],
      group: 'All',
      test: 'All',
    });
    setShowFilterModal(false);
    if (setCurrentDate) {
      setCurrentDate(currentDate || new Date().toISOString().split('T')[0]);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderComponent
        headerTitle="Study Result"
        onBackPress={() => router.back()}
        icon1Name="filter"
        icon1OnPress={() => setShowFilterModal(true)}
      />
      <View style={styles.headerContainer}>
        <DetailHeader 
          projectTitle={projectTitle}
          animalCounts={animalCounts}
          style={styles.detailHeader}
        />
      </View>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0288d1" />
            <Text style={styles.loadingText}>Loading tests...</Text>
          </View>
        ) : fetchError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{fetchError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchTests(true)}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : Object.keys(filteredTests).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {`No tests scheduled for ${formatDisplayDate(filters.startDate)}`}
            </Text>
          </View>
        ) : (
          <View style={styles.testsContainer}>
            {Object.entries(filteredTests).map(([groupName, groupTests]) => (
              <View key={`group-${groupName}`} style={styles.groupSection}>
                <Text style={styles.groupName}>{`${groupTests[0]?.groupIdUser || 'ID'} [${groupName}]`}</Text>
                {groupTests.map((test) => (
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

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        setFilters={setFilters}
        groups={groups}
        tests={[...new Set(allTests.map((test) => test.name))]}
        clearFilters={clearFilters}
        currentDate={currentDate || new Date().toISOString().split('T')[0]}
      />
    </View>
  );
};

// Add this helper function if not already available
function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    zIndex: 5,
    elevation: 4,
    backgroundColor: '#f8fafc',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  detailHeader: {
    zIndex: 5,
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  scrollView: {
    flex: 1,
    zIndex: 0,
  },
  scrollViewContent: {
    paddingTop: 0, 
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