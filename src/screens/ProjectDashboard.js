import { useContext } from 'react';
import styled from 'styled-components/native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ProjectContext } from '../../context/ProjectContext';
import InfoCard from '../components/InfoCard';
import HeaderComponent from '../components/HeaderComponent';
import DetailHeader from '../components/DetailHeader';

const Container = styled.View`
  background-color: #f8fffe;
  flex: 1;
`;

const CardContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  padding: 16px;
`;

const ContentContainer = styled.View`
  flex: 1;
`;

const ProjectDashboard = () => {
  const router = useRouter();
  const { ref_num } = useLocalSearchParams();
  const { projectTitles, groupsByProject, testsByProject, activitiesByProject, todaysTasks } = useContext(ProjectContext);
  const projectTitle = projectTitles[ref_num] || ref_num;
  const groupCount = (groupsByProject[ref_num] || []).length;
  const testCount = (testsByProject[ref_num] || []).length;
  const activityCount = (activitiesByProject[ref_num] || []).length;
  const resultCount = todaysTasks.filter(task => task.projectCode === ref_num).length;

  const handleBackPress = () => {
    router.back();
  };

  const handleCardClick = (type) => {
    switch (type) {
      case 'My Activities':
        router.push({
          pathname: 'ActivityList',
          params: { ref_num },
        });
        break;
      case 'Study Group':
        router.push({
          pathname: 'GroupList',
          params: { ref_num },
        });
        break;
      case 'Study Test':
        router.push({
          pathname: 'TestList',
          params: { ref_num, selectedGroup: 'All' },
        });
        break;
      case 'Study Result':
        router.push({
          pathname: 'StudyResult',
          params: { ref_num, selectedGroup: 'All' },
        });
        break;
      default:
        break;
    }
  };

  return (
    <Container>
      <StatusBar style="dark" backgroundColor="#5ed2ce" />
      <HeaderComponent headerTitle="Project Dashboard" onBackPress={handleBackPress} />
      
      <ContentContainer>
        <DetailHeader 
          projectTitle={projectTitle}
          projectCode={ref_num}
        />

        <CardContainer>
          <InfoCard
            number={activityCount}
            label="My Activities"
            iconName="format-list-checks"
            gradientColors={['#007bff', '#00c6ff']}
            onPress={() => handleCardClick('My Activities')}
          />
          <InfoCard
            number={groupCount}
            label="Study Group"
            iconName="group"
            gradientColors={['#38ef7d', '#11998e']}
            onPress={() => handleCardClick('Study Group')}
          />
          <InfoCard
            number={testCount}
            label="Study Test"
            iconName="beaker-outline"
            gradientColors={['#f09819', '#ff512f']}
            onPress={() => handleCardClick('Study Test')}
          />
          <InfoCard
            number={resultCount}
            label="Study Result"
            iconName="chart-bar"
            gradientColors={['#e52d27', '#b31217']}
            onPress={() => handleCardClick('Study Result')}
          />
        </CardContainer>
      </ContentContainer>
    </Container>
  );
};

export default ProjectDashboard;