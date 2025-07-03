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

  const getAnimalCounts = (item) => {
    const maleCount = Array.isArray(item.rat_list_m) ? item.rat_list_m.length : 0;
    const femaleCount = Array.isArray(item.rat_list_f) ? item.rat_list_f.length : 0;
    return { maleCount, femaleCount };
  };

  const renderGroupItem = ({ item }) => {
    const { maleCount, femaleCount } = getAnimalCounts(item);
    const totalAnimals = maleCount + femaleCount;

    return (
      <TouchableOpacity
        style={styles.groupCard}
        onPress={() => handleSelectGroup(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.groupName}>{item.study_type || 'Unknown'}</Text>
            {item.dose_detail && (
              <View style={styles.doseBadge}>
                <Text style={styles.doseText}>{item.dose_detail}</Text>
              </View>
            )}
          </View>
          <Text style={styles.groupId}>{item.group_id} [{item.name}]</Text>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.animalCounts}>
            <View style={styles.countItem}>
              <Text style={styles.genderIcon}>♂</Text>
              <Text style={styles.countText}>{maleCount} Male</Text>
            </View>
            <View style={styles.countSeparator} />
            <View style={styles.countItem}>
              <Text style={styles.genderIcon}>♀</Text>
              <Text style={styles.countText}>{femaleCount} Female</Text>
            </View>
          </View>
          <View style={styles.totalBadge}>
            <Text style={styles.totalText}>Total: {totalAnimals}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderComponent headerTitle="Groups List" onBackPress={() => router.back()} />
      
      <View style={styles.detailHeaderContainer}>
        <DetailHeader
          projectTitle={projectTitle}
          speciesType={speciesName}
        />
      </View>

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
        <View style={styles.listContainer}>
          <FlatList
            data={groups}
            keyExtractor={(item) => item.group_id}
            renderItem={renderGroupItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },
  
  detailHeaderContainer: {
    zIndex: 10,
    elevation: 10,
    position: 'relative',
  },
  
  listContainer: {
    flex: 1,
    zIndex: 1,
    elevation: 1,
  },
  
  listContent: {
    padding: 16,
  },
  
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e8f8f7',
  },
  
  cardHeader: {
    marginBottom: 12,
  },
  
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    flex: 1,
  },
  
  doseBadge: {
    backgroundColor: '#33B1AF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  
  doseText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  groupId: {
    fontSize: 14,
    color: '#718096',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e8f8f7',
  },
  
  animalCounts: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  countItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  countSeparator: {
    width: 1,
    height: 16,
    backgroundColor: '#e8f8f7',
    marginHorizontal: 12,
  },
  
  genderIcon: {
    fontSize: 14,
    color: '#5ed2ce',
    marginRight: 4,
    fontWeight: 'bold',
  },
  
  countText: {
    fontSize: 14,
    color: '#2d3748',
    fontWeight: '500',
  },
  
  totalBadge: {
    backgroundColor: '#f0fdfc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e8f8f7',
  },
  
  totalText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2d3748',
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