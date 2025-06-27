import { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, Dimensions, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'; 
import styled from 'styled-components/native';
import { AppContext } from '../../context/AppContext';
import { ProjectContext } from '../../context/ProjectContext';
import { getCompanyInfo, getProfileInfo } from '../services/authServices';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const Container = styled.View`
  background-color: #f5f5f5;
`;

const GradientBackground = styled(LinearGradient).attrs({
  colors: ['#c2fbcd', '#ffdde1'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
})`
  align-items: center;
  height: 100%;
`;

const CompanyContainer = styled.View`
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 10px;
  background-color: #c2fbcd;
  align-items: center;
  gap: 20px;
`;

const CompanyTextContainer = styled.View`
  display: flex;
  align-items: flex-start;
`;

const LogoContainer = styled.View`
  width: ${width * 0.20}px;
  height: ${width * 0.20}px;
  background-color: #ffffff;
  border-radius: ${width * 0.25}px;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  margin-top: 5%;
`;

const Logo = styled.Image.attrs(() => ({
  resizeMode: 'contain',
}))`
  width: 95%;
  height: 95%;
  border-radius: ${width * 0.35}px;
`;

const CompanyName = styled.Text`
  font-size: 22px;
  font-weight: bold;
  margin: 10px 0;
  color: #333333;
`;

const SubHeader = styled.Text`
  font-size: 16px;
  margin-bottom: 20px;
  color: #555555;
`;

const NewHomeScreen = () => {
  const router = useRouter();
  const { projects, projectTitles, loading } = useContext(ProjectContext);
  const [company, setCompany] = useState({});
  const [profile, setProfile] = useState([]);

  useEffect(() => {
    getProfileInfo()
      .then((res) => {
        setProfile(res.data);
      })
      .catch((error) => {
        console.log('Error fetching profile:', error);
      });

    getCompanyInfo()
      .then((res) => {
        setCompany(res.data);
      })
      .catch((error) => {
        console.log('Error fetching company info:', error);
      });
  }, []);

  const handleSelectProject = (ref_num) => {
    router.push({
      pathname: 'ProjectDashboard',
      params: { ref_num },
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'in progress': return '#ea580c';
      case 'completed': return '#16a34a';
      default: return '#6366f1';
    }
  };

  const renderProjectItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.item, { borderLeftColor: getStatusColor(item.status) }]}
      onPress={() => handleSelectProject(item.ref_num)}
      activeOpacity={0.8}
    >
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
        <Text style={styles.status}>{item.status}</Text>
      </View>

      <View style={styles.itemContent}>
        <View style={styles.projectInfo}>
          <Text style={styles.ref}>{projectTitles[item.ref_num] || item.ref_num}</Text>
          <Text style={styles.label}>{item.ref_num}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Container>
      <StatusBar style="dark" backgroundColor="#c2fbcd" />
      <GradientBackground>
        <CompanyContainer>
          <LogoContainer>
            <Logo source={{ uri: company.image || 'https://home.atomwalk.com/static/media/Atom_walk_logo-removebg-preview.21661b59140f92dd7ced.png' }} />
          </LogoContainer>
          <CompanyTextContainer>
            <CompanyName>{company.name || 'Atomwalk Technologies'}</CompanyName>
            <SubHeader>Welcome {profile.user_name}</SubHeader>
          </CompanyTextContainer>
        </CompanyContainer>

        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.sectionTitle}>Projects</Text>
            <Text style={styles.projectCount}>{projects.length} Projects Available</Text>
          </View>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#6366f1" />
            </View>
          ) : (
            <FlatList
              data={projects}
              keyExtractor={(item) => item.ref_num}
              renderItem={renderProjectItem}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              style={styles.flatList}
            />
          )}
        </View>
      </GradientBackground>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    flex: 1, // ✅ ensures full height
    width: '100%',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  header: {
    paddingVertical: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  projectCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 20,
  },
  flatList: {
    flex: 1,
  },
  item: {
    backgroundColor: '#ffffff',
    marginBottom: 12,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    position: 'relative',
  },
  itemContent: {
    marginTop: 18,
  },
  projectInfo: {
    flex: 1,
  },
  ref: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  status: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default NewHomeScreen;
