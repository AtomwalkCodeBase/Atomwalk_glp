import { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, Dimensions, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { AppContext } from '../../context/AppContext';
import { ProjectContext } from '../../context/ProjectContext';
import { getCompanyInfo, getProfileInfo } from '../services/authServices';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const scaleWidth = (size) => (width / 375) * size;
const scaleHeight = (size) => (height / 812) * size;

const Container = styled.View`
  background-color: #f8fffe;
`;

const GradientBackground = styled.View`
  align-items: center;
  height: 100%;
`;

const CompanyContainer = styled.View`
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 20px;
  padding-top: 40px;
  background-color: #5ed2ce;
  align-items: center;
  gap: 20px;
  border-bottom-left-radius: ${scaleWidth(30)}px;
  border-bottom-right-radius: ${scaleWidth(30)}px;
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
  color: #333333;
`;

const NewHomeScreen = () => {
  const router = useRouter();
  const { projects, projectTitles, loading, fetchAllData, projectDates, formatDate } = useContext(ProjectContext);
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

    fetchAllData();
  }, []);

  const handleSelectProject = (ref_num) => {
    router.push({
      pathname: 'ProjectDashboard',
      params: { ref_num },
    });
  };

  const renderProjectItem = ({ item }) => {
    const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case 'completed': return '#4CAF50';
        case 'in progress': return '#FF9800';
        default: return '#9E9E9E';
      }
    };

    const getStatusBackgroundColor = (status) => {
      switch (status?.toLowerCase()) {
        case 'completed': return '#E8F5E9';
        case 'in progress': return '#FFF3E0';
        default: return '#F5F5F5';
      }
    };

    const getStatusTextColor = (status) => {
      switch (status?.toLowerCase()) {
        case 'completed': return '#2E7D32';
        case 'in progress': return '#EF6C00';
        default: return '#424242';
      }
    };

    const projectDate = projectDates[item.ref_num] || {};
    const startDate = formatDate(projectDate.startDate) || 'N/A';
    const endDate = formatDate(projectDate.endDate) || 'N/A';

    return (
      <TouchableOpacity
        style={[
          styles.item,
          { borderLeftColor: getStatusColor(item.status) }
        ]}
        onPress={() => handleSelectProject(item.ref_num)}
        activeOpacity={0.8}
      >
        <View style={styles.statusBadgeContainer}>
          <View style={[
            styles.statusBadge,
            {
              backgroundColor: getStatusBackgroundColor(item.status),
              borderColor: getStatusColor(item.status),
            }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusTextColor(item.status) }
            ]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.itemContent}>
          <Text style={styles.label}>{item.ref_num}</Text>
          <Text style={styles.ref}>{projectTitles[item.ref_num] || item.ref_num}</Text>
          <View style={styles.dateContainer}>
            <View style={styles.dateItem}>
              <Ionicons name="calendar-outline" size={16} color="#64748b" style={styles.calendarIcon} />
              <Text style={styles.dateText}>Start: {startDate}</Text>
            </View>
            <View style={styles.spacer} />
            <View style={styles.dateItem}>
              <Ionicons name="calendar-outline" size={16} color="#64748b" style={styles.calendarIcon} />
              <Text style={styles.dateText}>End: {endDate}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Container>
      <StatusBar style="dark" backgroundColor="#5ed2ce" />
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
              < ActivityIndicator size="large" color="#088f8f" />
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
    backgroundColor: '#f8fffe',
    borderRadius: 12,
    paddingHorizontal: 16,
    flex: 1,
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
    marginVertical: 8,
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
    minHeight: 120
  },
  statusBadgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemContent: {
    marginTop: 0,
    flexDirection: 'column',
  },
  ref: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 4,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
  calendarIcon: {
    marginRight: 6,
  },
  dateText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
});

export default NewHomeScreen;