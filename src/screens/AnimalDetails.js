import { useContext } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HeaderComponent from '../components/HeaderComponent';
import { ProjectContext } from '../../context/ProjectContext';

const AnimalDetails = () => {
  const router = useRouter();
  const { ref_num } = useLocalSearchParams();
  const { projectTitles, selectedGroup } = useContext(ProjectContext);
  const projectTitle = projectTitles[ref_num] || ref_num;
  const group = selectedGroup;
  const groupName = selectedGroup?.study_type || 'Unknown';

  // Get male and female animals (default to empty arrays if not available)
  const maleAnimals = Array.isArray(group?.rat_list_m) ? group.rat_list_m : [];
  const femaleAnimals = Array.isArray(group?.rat_list_f) ? group.rat_list_f : [];

  const getSpeciesType = (species) => ({
    R: 'Rat',
    P: 'Pig',
    M: 'Monkey',
    D: 'Dog',
  }[species] || 'Unknown');

  // Combine male and female animals with headers for display
  const allAnimals = [
    ...(maleAnimals.length > 0 ? [{ 
      type: 'header', 
      id: 'male', 
      label: `Male ${getSpeciesType(group?.species_type)}s`,
      count: maleAnimals.length
    }] : []),
    ...maleAnimals.map(animal => ({ ...animal, type: 'animal' })),
    ...(femaleAnimals.length > 0 ? [{ 
      type: 'header', 
      id: 'female', 
      label: `Female ${getSpeciesType(group?.species_type)}s`,
      count: femaleAnimals.length
    }] : []),
    ...femaleAnimals.map(animal => ({ ...animal, type: 'animal' })),
  ];

  // Format date (e.g., "20250623" -> "23/06/2025")
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(
      dateStr.slice(0, 4), // year
      dateStr.slice(4, 6) - 1, // month (0-based)
      dateStr.slice(6, 8) // day
    ).toLocaleDateString('en-GB');
  };

  // Render each item in the list (header or animal card)
  const renderAnimalItem = ({ item }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{item.label} ({item.count})</Text>
        </View>
      );
    }

    return (
      <View style={styles.animalCard}>
        {/* First row - Animal ID */}
        <View style={styles.cardRow}>
          <Text style={styles.animalId}>{item.a_id}</Text>
          <Text style={styles.genderText}>
            {item.a_type === 'M' ? 'Male' : item.a_type === 'F' ? 'Female' : 'Unknown'}
          </Text>
        </View>
        
        {/* Second row - Source and Strain */}
        <View style={styles.cardRow}>
          <Text style={styles.cardText}>Source: {item.source || 'N/A'}</Text>
          <Text style={styles.cardText}>Strain: {item.strain || 'N/A'}</Text>
        </View>
        
        {/* Third row - Serial and Date */}
        <View style={styles.cardRow}>
          <Text style={styles.cardText}>Serial: {item.a_srl_num || 'N/A'}</Text>
          <Text style={styles.cardText}>Date: {formatDate(item.source_date)}</Text>
        </View>
      </View>
    );
  };

  const totalAnimals = maleAnimals.length + femaleAnimals.length;

  return (
    <View style={styles.container}>
      <HeaderComponent headerTitle="Animal Details" onBackPress={() => router.back()} />
      
      {/* Project info */}
      <View style={styles.infoContainer}>
        <Text style={styles.projectTitle}>{projectTitle}</Text>
        <Text style={styles.projectSubtitle}>
          Species Type:  {getSpeciesType(group?.species_type)} ({totalAnimals}) 
        </Text>
      </View>

      {/* Show animals or empty state */}
      {allAnimals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No animal details available</Text>
        </View>
      ) : (
        <FlatList
          data={allAnimals}
          keyExtractor={(item) => item.type === 'header' ? item.id : item.a_id}
          renderItem={renderAnimalItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  projectSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  listContainer: {
    padding: 16,
  },
  sectionHeader: {
    backgroundColor: '#2196f3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 16,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  animalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  animalId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2196f3',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  cardText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default AnimalDetails;