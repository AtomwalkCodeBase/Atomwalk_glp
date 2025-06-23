import React, { useContext } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ProjectContext } from '../../context/ProjectContext';
import InfoCard from '../components/InfoCard';
import HeaderComponent from '../components/HeaderComponent';

const { width } = Dimensions.get('window');

const Container = styled.View`
  background-color: #f5f5f5;
  flex: 1;
`;

const CardContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  padding: 20px;
  width: 100%;
`;

const ContentContainer = styled.View`
  flex: 1;
  padding: 16px;
`;

const ProjectHeader = styled.View`
  background-color: #ffffff;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const ProjectTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

const ProjectSubtitle = styled.Text`
  font-size: 14px;
  color: #64748b;
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
      <StatusBar style="dark" backgroundColor="#c2fbcd" />
      <HeaderComponent headerTitle="Project Dashboard" onBackPress={handleBackPress} />
      <ContentContainer>
        <ProjectHeader>
          <ProjectTitle>{projectTitle}</ProjectTitle>
          <ProjectSubtitle>Project Id: {ref_num}</ProjectSubtitle>
        </ProjectHeader>
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

const styles = StyleSheet.create({
  sectionTitle: {
    padding: 12,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
  },
});

export default ProjectDashboard;