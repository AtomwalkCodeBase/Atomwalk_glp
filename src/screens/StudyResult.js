import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import HeaderComponent from '../components/HeaderComponent';
import { ProjectContext } from '../../context/ProjectContext';
import DropdownPicker from '../components/DropdownPicker';
import { StyleSheet } from 'react-native';

const StudyResult = () => {
  const { ref_num, refresh } = useLocalSearchParams();
  const router = useRouter();
  const {
    projectTitles,
    groupsByProject,
    testsByProject,
    getTestsForDate,
    getCompletionStatus,
    CURRENT_DATE,
  } = useContext(ProjectContext);
  const projectTitle = projectTitles[ref_num] || ref_num;

  const tabs = ['Yesterday', 'Today', 'Tomorrow'];
  const TODAY = CURRENT_DATE;

  const tabDates = {
    Yesterday: new Date(CURRENT_DATE),
    Today: CURRENT_DATE,
    Tomorrow: new Date(CURRENT_DATE)
  };
  tabDates.Yesterday.setDate(CURRENT_DATE.getDate() - 1);
  tabDates.Tomorrow.setDate(CURRENT_DATE.getDate() + 1);

  const groups = groupsByProject[ref_num] || [];
  const allTests = testsByProject[ref_num] || [];

  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedTest, setSelectedTest] = useState('All');
  const [selectedTab, setSelectedTab] = useState('Today');
  const [groupedTests, setGroupedTests] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const handleNavigation = useCallback((test) => {
    router.push({
      pathname: '/CaptureData',
      params: {
        ref_num,
        groupId: test.groupId,
        test: JSON.stringify(test),
        scheduleDate: test.scheduleDate.toISOString().split('T')[0],
      },
    });
  }, [router, ref_num]);

  const fetchTests = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setFetchError(null);
    try {
      // Get tests for the selected date
      const dateForTab = tabDates[selectedTab];
      const fetchedTests = getTestsForDate(ref_num, dateForTab);

      // Filter tests based on selected group and test
      const filteredTests = fetchedTests.filter(test => {
        const matchesGroup = selectedGroup === 'All' || test.groupName === selectedGroup;
        const matchesTest = selectedTest === 'All' || test.name === selectedTest;
        return matchesGroup && matchesTest;
      });

      // Get completion status for each test
      const testsWithCompletion = await Promise.all(
        filteredTests.map(async test => {
          const completion = await getCompletionStatus(
            ref_num,
            test.groupId,
            test.id,
            test.scheduleDate.toISOString().split('T')[0],
            forceRefresh // Pass forceRefresh flag
          );
          return { ...test, completion };
        })
      );

      // Group tests by group name
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
  }, [ref_num, selectedTab, selectedTest, selectedGroup, getTestsForDate, getCompletionStatus]);

  // Handle navigation focus to check for refresh flag
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

  // Format date for display
  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get test status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#4CAF50';
      case 'Pending': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  return (
    <View style={styles.container}>
      <HeaderComponent headerTitle="Study Result" onBackPress={() => router.back()} />

      <View style={styles.sectionHeader}>
        <Text style={styles.projectName}>{`Project: ${projectTitle}`}</Text>

        {/* Filters */}
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

        {/* Date Tabs */}
        <View style={styles.tabContainer}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                selectedTab === tab ? styles.activeTab : styles.inactiveTab
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[
                styles.tabText,
                selectedTab === tab ? styles.activeTabText : styles.inactiveTabText
              ]}>
                {tab}
              </Text>
              <Text style={styles.tabDate}>
                {formatDisplayDate(tabDates[tab])}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Test List - Fixed ScrollView */}
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
              onPress={() => fetchTests(true)} // Force refresh on retry
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : Object.keys(groupedTests).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {`No tests scheduled for ${selectedTab.toLowerCase()}`}
            </Text>
          </View>
        ) : (
          <View style={styles.testsContainer}>
            {Object.entries(groupedTests).map(([groupName, groupTests]) => (
              <View key={`group-${groupName}`} style={styles.groupSection}>
                <Text style={styles.groupName}>  {`${groupName} [${groupTests[0]?.groupIdUser || 'ID'}]`}</Text>

                {groupTests.map(test => {
                  const completionPercentage = test.completion.totalCount > 0
                    ? Math.round((test.completion.completedCount / test.completion.totalCount) * 100)
                    : 0;

                  return (
                    <TouchableOpacity
                      key={`test-${test.id}-${test.groupId}`}
                      style={[
                        styles.testCard,
                        {
                          borderLeftColor: getStatusColor(test.completion.status),
                          opacity: selectedTab === 'Today' ? 1 : 0.7
                        }
                      ]}
                      onPress={() => selectedTab === 'Today' && handleNavigation(test)}
                      activeOpacity={selectedTab === 'Today' ? 0.7 : 1}
                    >
                      <View style={styles.testHeader}>
                        <Text style={styles.testName}>{test.name}</Text>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(test.completion.status) }
                        ]}>
                          <Text style={styles.statusText}>
                            {test.completion.totalCount === 0 ? 'No Rats' : test.completion.status}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.testDetails}>
                        <Text style={styles.detailText}>
                          <Text style={styles.detailLabel}>Date: </Text>
                          {formatDisplayDate(test.scheduleDate)}
                        </Text>

                        <Text style={styles.detailText}>
                          <Text style={styles.detailLabel}>Frequency: </Text>
                          {test.frequencyLabel}
                        </Text>

                        {test.completion.totalCount > 0 ? (
                          <Text style={styles.detailText}>
                            {`${test.completion.completedCount}/${test.completion.totalCount} Completed`}
                            {test.completion.completedCount > 0 && (
                              <Text style={{ color: '#4CAF50' }}>
                                {` (${completionPercentage}%)`}
                              </Text>
                            )}
                          </Text>
                        ) : (
                          <Text style={[styles.detailText, { color: '#9E9E9E' }]}>
                            No rats assigned to this group
                          </Text>
                        )}
                      </View>

                      {selectedTab !== 'Today' && (
                        <Text style={styles.viewOnlyText}>
                          {`View only - cannot capture data for ${selectedTab.toLowerCase()}`}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
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
  filterContainer: {
    marginBottom: 12,
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
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0288d1',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0288d1',
  },
  inactiveTabText: {
    color: '#64748b',
  },
  tabDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
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
  testCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flexShrink: 1,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  testDetails: {
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#475569',
  },
  detailLabel: {
    fontWeight: '600',
    color: '#334155',
  },
  viewOnlyText: {
    marginTop: 8,
    fontSize: 12,
    color: '#ef4444',
    fontStyle: 'italic',
  },
});

export default StudyResult;