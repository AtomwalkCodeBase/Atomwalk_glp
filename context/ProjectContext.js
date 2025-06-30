import { createContext, useState, useEffect, useCallback } from 'react';
import { getActivityList, getGLPGroupList, getGLPTestList, getGLPTestDataList } from '../src/services/productServices';

const ProjectContext = createContext();

const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [activitiesByProject, setActivitiesByProject] = useState({});
  const [groupsByProject, setGroupsByProject] = useState({});
  const [groupIdMap, setGroupIdMap] = useState({});
  const [testsByProject, setTestsByProject] = useState({});
  const [todaysTasks, setTodaysTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [projectTitles, setProjectTitles] = useState({});
  const [completionCache, setCompletionCache] = useState({});

  const START_DATE = new Date('2025-05-22');
  const END_DATE = new Date('2025-07-11');
  const CURRENT_DATE = new Date('2025-05-27');

  const formatDate = (date) => date.toISOString().split('T')[0];

  const normalizeTestDate = (dateStr) => {
    if (!dateStr) return '';
    const months = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [day, month, year] = parts;
    const monthNum = months[month] || month.padStart(2, '0');
    return `${day.padStart(2, '0')}-${monthNum}-${year}`;
  };

  const getRatIds = useCallback((group) => {
    const maleRats = Array.isArray(group.rat_list_m) ? group.rat_list_m : [];
    const femaleRats = Array.isArray(group.rat_list_f) ? group.rat_list_f : [];
    return {
      male: maleRats.map(rat => rat.a_id),
      female: femaleRats.map(rat => rat.a_id),
    };
  }, []);

  const getAnimalName = useCallback((speciesType) => {
    switch (speciesType?.toUpperCase()) {
      case 'R': return 'Rat';
      case 'P': return 'Pig';
      case 'D': return 'Dog';
      default: return 'Other';
    }
  }, []);

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const getTestSchedule = (test, currentDate = CURRENT_DATE) => {
    const testStartDate = addDays(START_DATE, test.no_of_days || 0);

    let scheduleDates = [];
    const frequencyLabel = test.test_frequency_display || 'Unknown';

    if (test.test_frequency === 'N' && test.date_schedule) {
      scheduleDates = test.date_schedule
        .split(',')
        .map(dateStr => new Date(dateStr.trim()))
        .filter(date => !isNaN(date.getTime()) && date >= START_DATE && date <= END_DATE);
    } else {
      switch (test.test_frequency) {
        case 'D':
          for (let date = new Date(testStartDate); date <= END_DATE; date = addDays(date, 1)) {
            scheduleDates.push(new Date(date));
          }
          break;
        case 'W':
          for (let date = new Date(testStartDate); date <= END_DATE; date = addDays(date, 7)) {
            scheduleDates.push(new Date(date));
          }
          break;
        case 'O':
          if (testStartDate >= START_DATE && testStartDate <= END_DATE) {
            scheduleDates.push(new Date(testStartDate));
          }
          break;
        case 'B':
          const beforeDate = addDays(testStartDate, -1);
          if (beforeDate >= START_DATE && beforeDate <= END_DATE) {
            scheduleDates.push(new Date(beforeDate));
          }
          break;
        default:
          break;
      }
    }

    const formatDate = (date) => date.toISOString().split('T')[0];

    const todayStr = formatDate(currentDate);
    const yesterday = addDays(currentDate, -1);
    const tomorrow = addDays(currentDate, 1);

    const yesterdayStr = formatDate(yesterday);
    const tomorrowStr = formatDate(tomorrow);

    let status = 'None';
    if (scheduleDates.some(date => formatDate(date) === todayStr)) {
      status = 'Today';
    } else if (scheduleDates.some(date => formatDate(date) === yesterdayStr)) {
      status = 'Yesterday';
    } else if (scheduleDates.some(date => formatDate(date) === tomorrowStr)) {
      status = 'Tomorrow';
    }

    return {
      status,
      scheduleDates,
      frequencyLabel,
      testStartDate,
    };
  };

  const isTestScheduledToday = (test) => {
    const { status } = getTestSchedule(test);
    return status === 'Today';
  };

  const getTestsForDate = (refNum, date) => {
    const tests = testsByProject[refNum] || [];
    const groups = groupsByProject[refNum] || [];
    const dateStr = formatDate(new Date(date));
    const result = [];

    tests.forEach(test => {
      const { scheduleDates, frequencyLabel, testStartDate } = getTestSchedule(test);
      if (scheduleDates.some(d => formatDate(d) === dateStr)) {
        groups.forEach(group => {
          result.push({
            ...test,
            groupName: group.study_type,
            groupId: group.id,
            groupIdUser: group.group_id,
            frequencyLabel,
            scheduleDate: new Date(dateStr),
            testStartDate,
            species: group.species
          });
        });
      }
    });

    return result;
  };

  const getCapturedData = useCallback(async (refNum, groupId = null, testId = null, scheduleDate = null, ratId = null) => {
    try {
      const response = await getGLPTestDataList(refNum);
      if (response.status === 200) {
        let data = response?.data || [];

        data = data.map(item => ({
          ...item,
          group_id: groupIdMap[item.test_group_id] || item.group_id,
          test_date: normalizeTestDate(item.test_date),
        }));

        if (groupId) data = data.filter(item => item.group_id === groupId);
        if (testId) {
          const testIds = Array.isArray(testId) ? testId : [testId];
          data = data.filter(item => testIds.includes(item.test_type_id));
        }
        if (scheduleDate) {
          const formattedDate = scheduleDate.split('-').reverse().join('-');
          data = data.filter(item => item.test_date === formattedDate);
        }
        if (ratId) data = data.filter(item => item.rat_no === ratId);

        return data;
      }
      return [];
    } catch (err) {
      console.error('Error fetching test data:', err);
      setErrors(prev => ({
        ...prev,
        [refNum]: { ...prev[refNum], testData: `Failed to fetch test data` },
      }));
      return [];
    }
  }, [groupIdMap, normalizeTestDate]);

  const updateCompletionCache = useCallback((refNum, groupId, testId, scheduleDate, completion) => {
    const cacheKey = `${refNum}-${groupId}-${testId}-${scheduleDate}`;
    setCompletionCache(prev => ({
      ...prev,
      [cacheKey]: completion
    }));
  }, []);

  const getCompletionStatus = useCallback(async (refNum, groupId, testId, scheduleDate, forceRefresh = false) => {
    const cacheKey = `${refNum}-${groupId}-${testId}-${scheduleDate}`;

    if (!forceRefresh && completionCache[cacheKey]) {
      return completionCache[cacheKey];
    }

    const group = (groupsByProject[refNum] || []).find(g => g.id === groupId);
    if (!group) return { status: 'Not Assigned', completedCount: 0, totalCount: 0, animalName: 'Unknown' };

    const test = (testsByProject[refNum] || []).find(t => t.id === testId);
    const isSubTypeApplicable = test?.is_sub_type_applicable;
    const subTypes = test?.test_sub_type_list || [];

    const maleRats = Array.isArray(group.rat_list_m) ? group.rat_list_m : [];
    const femaleRats = Array.isArray(group.rat_list_f) ? group.rat_list_f : [];
    const totalRats = maleRats.length + femaleRats.length;
    const ratIds = [...getRatIds(group).male, ...getRatIds(group).female];
    const animalName = getAnimalName(group.species_type);

    if (totalRats === 0) {
      return { status: 'Not Assigned', completedCount: 0, totalCount: 0, animalName };
    }

    const data = await getCapturedData(
      refNum,
      groupId,
      isSubTypeApplicable ? subTypes.map(st => st.id) : testId,
      scheduleDate
    );

    let completedCount = 0;

    for (const ratId of ratIds) {
      const ratData = data.filter(item => item.rat_no === ratId);

      if (isSubTypeApplicable) {
        const allSubTypesFilled = subTypes.every(subType =>
          ratData.some(item =>
            item.test_type_id === subType.id &&
            item.test_sub_type === subType.test_sub_type &&
            item.t_value !== '' &&
            item.t_value !== null
          )
        );
        if (allSubTypesFilled) completedCount++;
      } else {
        const hasData = ratData.some(item =>
          item.test_type_id === testId &&
          item.t_value !== '' &&
          item.t_value !== null
        );
        if (hasData) completedCount++;
      }
    }

    const completion = {
      status: totalRats > 0
        ? (completedCount >= totalRats ? 'Completed' : 'Pending')
        : 'Not Assigned',
      completedCount,
      totalCount: totalRats,
      animalName
    };

    updateCompletionCache(refNum, groupId, testId, scheduleDate, completion);
    return completion;
  }, [groupsByProject, testsByProject, getRatIds, getCapturedData, completionCache, updateCompletionCache, getAnimalName]);

  const getAnimalCounts = useCallback(async (refNum, date) => {
    const tests = getTestsForDate(refNum, date);
    let totalAnimals = 0;
    let completedAnimals = 0;

    for (const test of tests) {
      const completion = await getCompletionStatus(
        refNum,
        test.groupId,
        test.id,
        test.scheduleDate.toISOString().split('T')[0],
        false
      );
      totalAnimals += completion.totalCount;
      completedAnimals += completion.completedCount;
    }

    return {
      totalAnimals,
      completedAnimals,
      pendingAnimals: totalAnimals - completedAnimals
    };
  }, [getTestsForDate, getCompletionStatus]);

  const fetchAllData = async () => {
    setLoading(true);
    setErrors({});

    try {
      let allActivities = [];
      try {
        const projectRes = await getActivityList();
        allActivities = projectRes?.data?.a_list || [];
      } catch (err) {
        setErrors(prev => ({ ...prev, activities: 'Failed to load projects' }));
      }

      const activitiesGrouped = allActivities.reduce((acc, activity) => {
        const refNum = activity.ref_num;
        if (!acc[refNum]) acc[refNum] = [];
        acc[refNum].push(activity);
        return acc;
      }, {});
      setActivitiesByProject(activitiesGrouped);

      const uniqueActivities = Array.from(
        new Map(allActivities.map(item => [item.ref_num, item])).values()
      );

      const sortedActivities = uniqueActivities.sort((a, b) => {
        const getStatusPriority = (status) => {
          switch (status?.toLowerCase()) {
            case 'in progress': return 1;
            case 'completed': return 2;
            default: return 3;
          }
        };
        return getStatusPriority(a.status) - getStatusPriority(b.status);
      });

      setProjects(sortedActivities);

      const groupsData = {};
      const groupIdMapping = {};
      const testsData = {};
      const tasks = {};
      const titles = {};

      await Promise.all(sortedActivities.map(async (project) => {
        const refNum = project.ref_num;
        try {
          const [groupRes, testRes] = await Promise.all([
            getGLPGroupList(refNum).catch(err => ({ status: 500, data: [] })),
            getGLPTestList(refNum).catch(err => ({ status: 500, data: [] })),
          ]);

          if (groupRes.status === 200) {
            groupsData[refNum] = groupRes.data.map(group => ({
              ...group,
              id: group.id,
              group_id: group.group_id,
            })) || [];
            groupRes.data.forEach(group => {
              groupIdMapping[group.group_id] = group.id;
            });
            titles[refNum] = groupRes.data[0]?.project_title || refNum;
          } else {
            setErrors(prev => ({
              ...prev,
              [refNum]: { ...prev[refNum], groups: `Failed to load groups for project ${refNum}` },
            }));
          }

          if (testRes.status === 200) {
            testsData[refNum] = testRes.data || [];
            for (const group of groupsData[refNum] || []) {
              for (const test of testRes.data || []) {
                if (isTestScheduledToday(test)) {
                  if (!tasks[refNum]) tasks[refNum] = [];
                  tasks[refNum].push({
                    projectCode: test.project_code,
                    groupName: group.study_type,
                    group,
                    test,
                  });
                }
              }
            }
          } else {
            setErrors(prev => ({
              ...prev,
              [refNum]: { ...prev[refNum], tests: `Failed to load tests for project ${refNum}` },
            }));
          }
        } catch (err) {
          setErrors(prev => ({
            ...prev,
            [refNum]: { ...prev[refNum], general: `Error processing project ${refNum}` },
          }));
        }
      }));

      setGroupsByProject(groupsData);
      setGroupIdMap(groupIdMapping);
      setTestsByProject(testsData);
      setTodaysTasks(Object.values(tasks).flat());
      setProjectTitles(titles);
    } catch (err) {
      setErrors(prev => ({ ...prev, general: 'Error fetching data' }));
    } finally {
      setLoading(false);
    }
  };

  const contextValue = {
    projects,
    activitiesByProject,
    groupsByProject,
    groupIdMap,
    testsByProject,
    todaysTasks,
    loading,
    errors,
    projectTitles,
    selectedGroup,
    setSelectedGroup,
    isTestScheduledToday,
    getTestSchedule,
    getRatIds,
    getTestsForDate,
    getCapturedData,
    getCompletionStatus,
    getAnimalCounts,
    updateCompletionCache,
    START_DATE,
    END_DATE,
    CURRENT_DATE,
    fetchAllData
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};

export { ProjectContext, ProjectProvider };