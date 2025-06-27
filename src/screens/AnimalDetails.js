import { useContext } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HeaderComponent from '../components/HeaderComponent';
import { ProjectContext } from '../../context/ProjectContext';

const AnimalDetails = () => {
  const router = useRouter();
  const { projectTitles, groupsByProject, selectedRefNum, selectedGroup } = useContext(ProjectContext);
  const ref_num = selectedRefNum;
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
    ...(maleAnimals.length > 0 ? [{ type: 'header', id: 'male', label: `Male ${getSpeciesType(group?.species_type)}s` }] : []),
    ...maleAnimals.map(animal => ({ ...animal, type: 'animal' })),
    ...(femaleAnimals.length > 0 ? [{ type: 'header', id: 'female', label: `Female ${getSpeciesType(group?.species_type)}s` }] : []),
    ...femaleAnimals.map(animal => ({ ...animal, type: 'animal' })),
  ];

  // Format date (e.g., "20250623" -> "23-Jun-2025")
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(
      dateStr.slice(0, 4), // year
      dateStr.slice(4, 6) - 1, // month (0-based)
      dateStr.slice(6, 8) // day
    ).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Render each item in the list (header or animal card)
  const renderAnimalItem = ({ item }) => {
    if (item.type === 'header') {
      return <Text style={styles.sectionTitle}>{item.label}</Text>;
    }
    return (
      <View style={styles.animalCard}>
        <Text style={styles.animalId}>ID: {item.a_id}</Text>
        <Text style={styles.animalDetail}>Type: {item.a_type === 'M' ? 'Male' : item.a_type === 'F' ? 'Female' : 'Unknown'}</Text>
        <Text style={styles.animalDetail}>Source: {item.source || 'N/A'}</Text>
        <Text style={styles.animalDetail}>Strain: {item.strain || 'N/A'}</Text>
        <Text style={styles.animalDetail}>Serial: {item.a_srl_num || 'N/A'}</Text>
        <Text style={styles.animalDetail}>Date: {formatDate(item.source_date)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <HeaderComponent headerTitle="Animal Details" onBackPress={() => router.back()} />
      {/* Project, group, and species info */}
      <View style={styles.headerSection}>
        <Text style={styles.headerText}>Project: {projectTitle || 'Unknown'}</Text>
        <Text style={styles.headerText}>Group: {groupName || 'Unknown'}</Text>
        <Text style={styles.headerText}>Species: {getSpeciesType(group?.species_type)}</Text>
      </View>
      {/* Show animals or error message */}
      {allAnimals.length === 0 ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No animal details available.</Text>
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
    backgroundColor: '#f8fafc',
  },
  headerSection: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    textAlign: 'center',
  },
  listContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginVertical: 10,
  },
  animalCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  animalId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  animalDetail: {
    fontSize: 14,
    color: '#777',
    marginBottom: 3,
  },
});

export default AnimalDetails;
