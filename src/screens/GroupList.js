import { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HeaderComponent from '../components/HeaderComponent';
import DetailHeader from '../components/DetailHeader';
import { ProjectContext } from '../../context/ProjectContext';

const GroupList = () => {
  const { groupsByProject, projectTitles, setSelectedGroup, errors } = useContext(ProjectContext);
  const { ref_num } = useLocalSearchParams();
  const router = useRouter();
  const groups = groupsByProject[ref_num] || [];
  const projectTitle = projectTitles[ref_num] || ref_num;

  const [speciesName, setSpeciesName] = useState("Others");

  useEffect(() => {
    if (groups.length > 0) {
      setSpeciesName(getSpeciesType());
    }
  }, [groups]);

  const handleSelectGroup = (item) => {
    setSelectedGroup(item);
    router.push({
      pathname: 'AnimalDetails',
      params: {
        ref_num,
        speciesName: speciesName,
      },
    });
  };

  const getSpeciesType = () => {
    if (!groups || groups.length === 0 || !groups[0].species_type) return 'Unknown';

    switch (groups[0].species_type) {
      case 'R':
        return 'Rat';
      case 'P':
        return 'Pig';
      case 'D':
        return 'Dog';
      default:
        return 'Other';
    }
  };

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => handleSelectGroup(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.groupName}>{item.study_type || 'Unknown'}</Text>
      </View>
      
      <View style={styles.groupDetails}>
        <Text style={styles.groupId}>{item.group_id} [{item.name}]</Text>
        {item.dose_detail && (
          <Text style={styles.doseDetail}>{item.dose_detail}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <HeaderComponent headerTitle="Groups List" onBackPress={() => router.back()} />
      
      <DetailHeader
        projectTitle={projectTitle}
        speciesType={speciesName}
      />

      {errors[ref_num]?.groups ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: 'red' }]}>
            {errors[ref_num].groups}
          </Text>
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No groups are available</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.group_id}
          renderItem={renderGroupItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    padding: 16,
  },
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    marginBottom: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
  },
  groupDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupId: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  doseDetail: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
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

export default GroupList;