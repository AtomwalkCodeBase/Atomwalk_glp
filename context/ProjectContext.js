import { createContext, useState, useEffect } from 'react';
import { getActivityList, getGLPGroupList, getGLPTestList } from '../src/services/productServices';

const ProjectContext = createContext();

const ProjectProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [groupsByProject, setGroupsByProject] = useState({});
    const [testsByProject, setTestsByProject] = useState({});
    const [todaysTasks, setTodaysTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedProjectRef, setSelectedProjectRef] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [projectTitle, setProjectTitle] = useState('');


    const START_DATE = new Date('2025-06-13');
    const TODAY = new Date('2025-06-20'); 

    // Function to check if a test is scheduled for today
    const isTestScheduledToday = (test) => {
        const startDate = new Date(START_DATE);
        const daysSinceStart = Math.floor((TODAY - startDate) / (1000 * 60 * 60 * 24));

        switch (test.test_frequency) {
            case 'D': // Daily
                return daysSinceStart >= 0 && daysSinceStart < test.no_of_days;
            case 'W': // Weekly
                return daysSinceStart % 7 === 0 && daysSinceStart < test.no_of_days;
            case 'O': // One Time at the End
                return daysSinceStart === test.no_of_days - 1;
            case 'B': // One Time Before Start
                return daysSinceStart === 0;
            case 'N': // As per Date Schedule
                return false; // Skipped due to empty date_schedule
            default:
                return false;
        }
    };


    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Fetch projects
                const projectRes = await getActivityList();
                const uniqueActivities = projectRes?.data?.a_list.reduce((acc, current) => {
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

                // Fetch groups and tests for each project
                const groupsData = {};
                const testsData = {};
                const tasks = [];

                for (const project of sortedActivities) {
                    try {
                        // Fetch groups
                        const groupRes = await getGLPGroupList(project.ref_num);
                        if (groupRes.status === 200) {
                            groupsData[project.ref_num] = groupRes.data;
                            // console.log("Groups", groupRes.data);
                        }

                        // Fetch tests
                        const testRes = await getGLPTestList(project.ref_num);
                        if (testRes.status === 200) {
                            testsData[project.ref_num] = testRes.data || [];
                            // console.log("Test", testRes.data);


                            // Calculate today's tasks
                            for (const group of groupRes.data || []) {
                                for (const test of testRes.data || []) {
                                    if (isTestScheduledToday(test)) {
                                        tasks.push({
                                            projectCode: test.project_code,
                                            groupName: group.name,
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
            } catch (err) {
                setError('Error fetching data');
                console.error('Error fetching activities:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
        // console.log("Todays Tasks", todaysTasks);
    }, []);

    // Update project title when selected project changes
    useEffect(() => {
        if (selectedProjectRef && groupsByProject[selectedProjectRef]) {
            setProjectTitle(groupsByProject[selectedProjectRef][0]?.project_title || selectedProjectRef);
        }
    }, [selectedProjectRef, groupsByProject]);

    const contextValue = {
        projects,
        groupsByProject,
        testsByProject,
        todaysTasks,
        loading,
        error,
        projectTitle,
        selectedProjectRef,
        selectedGroup,
        setSelectedProjectRef,
        setSelectedGroup,
    };

    return (
        <ProjectContext.Provider value={contextValue}>
            {children}
        </ProjectContext.Provider>
    );
};

export { ProjectContext, ProjectProvider };