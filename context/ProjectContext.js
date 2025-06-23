import { createContext, useState, useEffect } from 'react';
import { getActivityList, getGLPGroupList, getGLPTestList } from '../src/services/productServices';

const ProjectContext = createContext();

const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [activitiesByProject, setActivitiesByProject] = useState({});
  const [groupsByProject, setGroupsByProject] = useState({});
  const [testsByProject, setTestsByProject] = useState({});
  const [todaysTasks, setTodaysTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProjectRef, setSelectedProjectRef] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [projectTitles, setProjectTitles] = useState({});
  const [capturedData, setCapturedData] = useState({}); // Local state for captured data

  const START_DATE = new Date('2025-06-13');
  const TODAY = new Date('2025-06-13');

  const frequencyLabels = {
    D: 'Daily',
    W: 'Weekly',
    O: 'Once',
    B: 'Baseline',
    N: 'None',
  };

  // Generate rat IDs for a group
  const generateRatIds = (group) => {
    const { group_id, no_of_male, no_of_female, species_type } = group;
    const ratIds = [];
    const prefix = species_type === 'R' ? 'R' : species_type;
    
    for (let i = 1; i <= no_of_male; i++) {
      ratIds.push(`RM_${group_id}_${i.toString().padStart(2, '0')}`);
    }
    for (let i = 1; i <= no_of_female; i++) {
      ratIds.push(`RF_${group_id}_${i.toString().padStart(2, '0')}`);
    }
    return ratIds;
  };

  const getTestSchedule = (test, currentDate = TODAY) => {
    const startDate = new Date(START_DATE);
    let scheduleDates = [];
    let nextScheduleDate = null;
    const frequencyLabel = frequencyLabels[test.test_frequency] || 'Unknown';

    switch (test.test_frequency) {
      case 'D':
        for (let day = 0; day < test.no_of_days; day++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + day);
          scheduleDates.push(date);
        }
        break;
      case 'W':
        for (let day = 0; day < test.no_of_days; day += 7) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + day);
          scheduleDates.push(date);
        }
        break;
      case 'O':
        const dateO = new Date(startDate);
        dateO.setDate(startDate.getDate() + (test.no_of_days - 1));
        scheduleDates.push(dateO);
        break;
      case 'B':
        const dateB = new Date(startDate);
        scheduleDates.push(dateB);
        break;
      case 'N':
        return { status: 'Upcoming', scheduleDates: [], nextScheduleDate: null, frequencyLabel };
      default:
        return { status: 'Upcoming', scheduleDates: [], nextScheduleDate: null, frequencyLabel };
    }

    const todayStr = currentDate.toISOString().split('T')[0];
    let status = 'Upcoming';

    const futureDates = scheduleDates.filter(date => {
      const dateStr = date.toISOString().split('T')[0];
      if (dateStr === todayStr) {
        status = 'Today';
        return false;
      }
      if (date < currentDate) {
        status = 'Overdue';
        return false;
      }
      return true;
    });

    nextScheduleDate = futureDates.length > 0 ? futureDates[0] : null;

    if (scheduleDates.some(date => date.toISOString().split('T')[0] === todayStr)) {
      status = 'Today';
    }

    return { status, scheduleDates, nextScheduleDate, frequencyLabel };
  };

  const isTestScheduledToday = (test) => {
    const { status } = getTestSchedule(test, TODAY);
    return status === 'Today';
  };

  // Save captured data
  const saveCapturedData = (projectCode, groupId, testId, ratId, scheduleDate, data) => {
    setCapturedData(prev => {
      const newData = { ...prev };
      if (!newData[projectCode]) newData[projectCode] = {};
      if (!newData[projectCode][groupId]) newData[projectCode][groupId] = {};
      if (!newData[projectCode][groupId][testId]) newData[projectCode][groupId][testId] = {};
      newData[projectCode][groupId][testId][ratId] = {
        ...newData[projectCode][groupId][testId][ratId],
        [scheduleDate]: data,
      };
      return newData;
    });
  };

  // Get captured data
  const getCapturedData = (projectCode, groupId, testId, ratId, scheduleDate) => {
    return capturedData[projectCode]?.[groupId]?.[testId]?.[ratId]?.[scheduleDate] || null;
  };

  // Get completion status
  const getCompletionStatus = (projectCode, groupId, testId, scheduleDate) => {
    const data = capturedData[projectCode]?.[groupId]?.[testId] || {};
    const group = groupsByProject[projectCode]?.find(g => g.group_id === groupId);
    const totalRats = group ? (group.no_of_male + group.no_of_female) : 10;
    const completedRats = Object.keys(data).filter(ratId => data[ratId]?.[scheduleDate]).length;
    return {
      status: completedRats === totalRats ? 'Completed' : 'Pending',
      completedCount: completedRats,
      totalCount: totalRats,
    };
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const projectRes = await getActivityList();
        const allActivities = projectRes?.data?.a_list || [];

        const activitiesGrouped = allActivities.reduce((acc, activity) => {
          const refNum = activity.ref_num;
          if (!acc[refNum]) acc[refNum] = [];
          acc[refNum].push(activity);
          return acc;
        }, {});
        setActivitiesByProject(activitiesGrouped);

        const uniqueActivities = allActivities.reduce((acc, current) => {
          const x = acc.find(item => item.ref_num === current.ref_num);
          if (!x) acc.push(current);
          return acc;
        }, []);

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
        const testsData = {};
        const tasks = [];
        const titles = {};

        for (const project of sortedActivities) {
          try {
            const groupRes = await getGLPGroupList(project.ref_num);
            if (groupRes.status === 200) {
              groupsData[project.ref_num] = groupRes.data;
              titles[project.ref_num] = groupRes.data[0]?.project_title || project.ref_num;
            }

            const testRes = await getGLPTestList(project.ref_num);
            if (testRes.status === 200) {
              testsData[project.ref_num] = testRes.data || [];
              for (const group of groupRes.data || []) {
                for (const test of testRes.data || []) {
                  if (isTestScheduledToday(test)) {
                    tasks.push({
                      projectCode: test.project_code,
                      groupName: group.study_type,
                      group,
                      test,
                    });
                  }
                }
              }
            }
          } catch (err) {
            console.error(`Error fetching data for project ${project.ref_num}:`, err);
          }
        }

        setGroupsByProject(groupsData);
        setTestsByProject(testsData);
        setTodaysTasks(tasks);
        setProjectTitles(titles);
      } catch (err) {
        setError('Error fetching data');
        console.error('Error fetching activities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const contextValue = {
    projects,
    activitiesByProject,
    groupsByProject,
    testsByProject,
    todaysTasks,
    loading,
    error,
    projectTitles,
    selectedGroup,
    setSelectedGroup,
    isTestScheduledToday,
    getTestSchedule,
    generateRatIds,
    saveCapturedData,
    getCapturedData,
    getCompletionStatus,
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};

export { ProjectContext, ProjectProvider };