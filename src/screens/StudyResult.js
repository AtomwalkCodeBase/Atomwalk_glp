import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HeaderComponent from '../components/HeaderComponent';
import { ProjectContext } from '../../context/ProjectContext';
import DropdownPicker from '../components/DropdownPicker';

const StudyResult = () => {
  const { ref_num, selectedGroup: initialGroup, selectedTab: initialTab, selectedTest: initialTest } = useLocalSearchParams();
  const router = useRouter();
  const { projectTitles, groupsByProject, testsByProject, todaysTasks, getTestSchedule, getCompletionStatus } = useContext(ProjectContext);
  const projectTitle = projectTitles[ref_num] || ref_num;

  const tabs = ['Today', 'Upcoming', 'Overdue', 'Completed'];

  const groups = groupsByProject[ref_num] || [];
  const allTests = testsByProject[ref_num] || [];

  const validInitialGroup = groups.find(g => g.study_type === initialGroup) ? initialGroup : 'All';
  const validInitialTab = tabs.includes(initialTab) ? initialTab : 'Today';
  const validInitialTest = initialTest && (initialTest === 'All' || allTests.some(t => t.name === initialTest)) ? initialTest : 'All';
  const [selectedGroup, setSelectedGroup] = useState(validInitialGroup);
  const [selectedTest, setSelectedTest] = useState(validInitialTest);
  const [selectedTab, setSelectedTab] = useState(validInitialTab);
  const [groupedTests, setGroupedTests] = useState({});

  const CURRENT_DATE = new Date('2025-06-14');

  // Validate state when initial params change
  useEffect(() => {
    const groupValid = groups.find(g => g.study_type === selectedGroup) || selectedGroup === 'All';
    const testValid = selectedTest === 'All' || allTests.some(t => t.name === selectedTest);
    const tabValid = tabs.includes(selectedTab);

    if (!groupValid && selectedGroup !== 'All') {
      setSelectedGroup('All');
    }
    if (!testValid && selectedTest !== 'All') {
      setSelectedTest('All');
    }
    if (!tabValid && selectedTab !== 'Today') {
      setSelectedTab('Today');
    }
  }, [initialGroup, initialTest, initialTab, groups, allTests]);

  useEffect(() => {
    const projectTasks = todaysTasks.filter(task => task.projectCode === ref_num);

    const testsWithDetails = [];
    allTests.forEach(test => {
      if (test.project_code !== ref_num) return;
      if (selectedTest !== 'All' && test.name !== selectedTest) return;

      const { status, scheduleDates, nextScheduleDate, frequencyLabel } = getTestSchedule(test, CURRENT_DATE);
      const associatedGroups = projectTasks
        .filter(task => task.test.id === test.id && task.projectCode === ref_num)
        .map(task => ({ studyType: task.group.study_type, groupId: task.group.group_id }));

      const groupInfo = associatedGroups.length > 0
        ? associatedGroups
        : groups.map(g => ({ studyType: g.study_type, groupId: g.group_id }));

      if (selectedTab === 'Today' && status === 'Today') {
        groupInfo.forEach(({ studyType, groupId }) => {
          const completion = getCompletionStatus(ref_num, groupId, test.id, CURRENT_DATE.toISOString().split('T')[0]);
          testsWithDetails.push({
            ...test,
            status,
            scheduleDate: new Date(CURRENT_DATE),
            groupName: studyType,
            groupId,
            frequencyLabel,
            completion,
          });
        });
      } else if (selectedTab === 'Upcoming' && nextScheduleDate && nextScheduleDate > CURRENT_DATE) {
        groupInfo.forEach(({ studyType, groupId }) => {
          const completion = getCompletionStatus(ref_num, groupId, test.id, nextScheduleDate.toISOString().split('T')[0]);
          testsWithDetails.push({
            ...test,
            status,
            scheduleDate: nextScheduleDate,
            groupName: studyType,
            groupId,
            frequencyLabel,
            completion,
            occurrenceId: `${test.id}-next`,
          });
        });
      } else if (selectedTab === 'Overdue') {
        scheduleDates.forEach((date, index) => {
          if (date < CURRENT_DATE) {
            groupInfo.forEach(({ studyType, groupId }) => {
              const completion = getCompletionStatus(ref_num, groupId, test.id, date.toISOString().split('T')[0]);
              if (completion.status === 'Pending') {
                testsWithDetails.push({
                  ...test,
                  status: 'Overdue',
                  scheduleDate: date,
                  groupName: studyType,
                  groupId,
                  frequencyLabel,
                  completion,
                  occurrenceId: `${test.id}-${index}`,
                });
              }
            });
          }
        });
      } else if (selectedTab === 'Completed') {
        scheduleDates.forEach((date, index) => {
          if (date < CURRENT_DATE) {
            groupInfo.forEach(({ studyType, groupId }) => {
              const completion = getCompletionStatus(ref_num, groupId, test.id, date.toISOString().split('T')[0]);
              if (completion.status === 'Completed') {
                testsWithDetails.push({
                  ...test,
                  status: 'Completed',
                  scheduleDate: date,
                  groupName: studyType,
                  groupId,
                  frequencyLabel,
                  completion,
                  occurrenceId: `${test.id}-${index}`,
                });
              }
            });
          }
        });
      }
    });

    const grouped = {};
    testsWithDetails.forEach(test => {
      const groupName = test.groupName;
      if (selectedGroup !== 'All' && groupName !== selectedGroup) return;
      if (!grouped[groupName]) grouped[groupName] = [];
      grouped[groupName].push(test);
    });

    Object.keys(grouped).forEach(groupName => {
      grouped[groupName].sort((a, b) => {
        const statusA = a.completion.status === 'Pending' ? 0 : 1;
        const statusB = b.completion.status === 'Pending' ? 1 : 0;
        return statusA - statusB;
      });
    });

    const sortedGroupedTests = Object.keys(grouped)
      .sort((a, b) => {
        const hasPendingA = grouped[a].some(test => test.completion.status === 'Pending');
        const hasPendingB = grouped[b].some(test => test.completion.status === 'Pending');
        if (hasPendingA && !hasPendingB) return -1;
        if (!hasPendingA && hasPendingB) return 1;
        const indexA = groups.findIndex(g => g.study_type === a);
        const indexB = groups.findIndex(g => g.study_type === b);
        return indexA - indexB;
      })
      .reduce((acc, groupName) => {
        acc[groupName] = grouped[groupName];
        return acc;
      }, {});

    setGroupedTests(sortedGroupedTests);
  }, [selectedGroup, selectedTest, selectedTab, groupsByProject, testsByProject, todaysTasks, ref_num, getTestSchedule, getCompletionStatus]);

  return (
    <View style={styles.container}>
      <HeaderComponent headerTitle="Study Result" onBackPress={() => router.back()} />
      <View style={styles.sectionHeader}>
        <Text style={styles.projectName}>Project: {projectTitle}</Text>
        <View style={styles.filterContainer}>
          <View style={styles.filterRow}>
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownLabel}>Select Group</Text>
            </View>
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownLabel}>Select Test</Text>
            </View>
          </View>
          <View style={styles.filterRow}>
            <View style={styles.dropdownContainer}>
              <DropdownPicker
                label="Group"
                data={[
                  { label: 'All', value: 'All' },
                  ...(groupsByProject[ref_num] || []).map(group => ({ label: group.study_type, value: group.study_type })),
                ]}
                value={selectedGroup}
                setValue={setSelectedGroup}
              />
            </View>
            <View style={styles.dropdownContainer}>
              <DropdownPicker
                label="Test"
                data={[
                  { label: 'All', value: 'All' },
                  ...[...new Set((testsByProject[ref_num] || []).map(test => test.name))].map(name => ({ label: name, value: name })),
                ]}
                value={selectedTest}
                setValue={setSelectedTest}
              />
            </View>
          </View>
        </View>
        <View style={styles.tabContainer}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab ? styles.activeTab : styles.inactiveTab]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, selectedTab === tab ? styles.activeTabText : styles.inactiveTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.testsContainer}>
          {Object.keys(groupedTests).length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tests are available</Text>
            </View>
          ) : (
            Object.entries(groupedTests).map(([groupName, tests]) => (
              <View key={groupName} style={styles.groupSection}>
                <Text style={styles.groupName}>{groupName}</Text>
                <View style={styles.groupTestsContainer}>
                  {tests.map(test => (
                    <TouchableOpacity
                      key={test.occurrenceId || `${test.id}-${test.groupId}`}
                      style={[
                        styles.testCard,
                        selectedTab === 'Overdue' ? styles.overdueCard :
                        test.completion.status === 'Completed' ? styles.completedCard : styles.pendingCard
                      ]}
                      disabled={selectedTab === 'Upcoming'}
                      onPress={() =>
                        router.push({
                          pathname: '/CaptureData',
                          params: {
                            projectTitle,
                            groupId: test.groupId,
                            groupName,
                            test: JSON.stringify(test),
                            scheduleDate: test.scheduleDate.toISOString().split('T')[0],
                            isCompleted: selectedTab === 'Completed',
                            selectedTab,
                            selectedTest,
                            selectedGroup,
                          },
                        })
                      }
                    >
                      <View style={styles.testHeader}>
                        <Text style={styles.testName}>{test.name}</Text>
                        <Text style={[
                          styles.statusLabel,
                          selectedTab === 'Overdue' ? styles.overdueStatus :
                          test.completion.status === 'Completed' ? styles.completedStatus : styles.pendingStatus
                        ]}>
                          {selectedTab === 'Overdue' ? 'Overdue' : test.completion.status}
                        </Text>
                      </View>
                      <View style={styles.testDetails}>
                        <Text style={styles.detailText}>
                          Schedule Date: {test.scheduleDate.toISOString().split('T')[0]}
                        </Text>
                        <Text style={styles.detailText}>Frequency: {test.frequencyLabel}</Text>
                        <Text style={styles.detailText}>
                          {test.completion.completedCount}/{test.completion.totalCount} completed
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
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
    color: '#444',
    marginBottom: 10,
  },
  filterContainer: {
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dropdownContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0288d1',
  },
  inactiveTab: {
    borderBottomWidth: 0,
  },
  tabText: {
    fontSize: 16,
  },
  activeTabText: {
    color: '#0288d1',
    fontWeight: 'bold',
  },
  inactiveTabText: {
    color: '#6c757d',
  },
  testsContainer: {
    padding: 20,
  },
  groupSection: {
    marginBottom: 20,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  groupTestsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  testCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#0288d1',
  },
  overdueCard: {
    backgroundColor: '#f8d7da',
  },
  completedCard: {
    backgroundColor: '#e8f5e9',
  },
  pendingCard: {
    backgroundColor: '#fff3e0',
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  overdueStatus: {
    backgroundColor: '#dc3545',
    color: '#fff',
  },
  completedStatus: {
    backgroundColor: '#4caf50',
    color: '#fff',
  },
  pendingStatus: {
    backgroundColor: '#ff9800',
    color: '#fff',
  },
  testDetails: {
    marginLeft: 10,
  },
  detailText: {
    fontSize: 14,
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

export default StudyResult;