import { useContext } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HeaderComponent from '../components/HeaderComponent';
import { ProjectContext } from '../../context/ProjectContext';
import DetailHeader from '../components/DetailHeader';

const AnimalDetails = () => {
  const router = useRouter();
  const { ref_num, speciesName } = useLocalSearchParams();
  const { projectTitles, selectedGroup } = useContext(ProjectContext);
  const projectTitle = projectTitles[ref_num] || ref_num;
  const group = selectedGroup;

  // Get animals by gender
  const maleAnimals = Array.isArray(group?.rat_list_m) ? group.rat_list_m : [];
  const femaleAnimals = Array.isArray(group?.rat_list_f) ? group.rat_list_f : [];
  const totalAnimals = maleAnimals.length + femaleAnimals.length;

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    return `${day}/${month}/${year}`;
  };

  // Render animal card with gender-specific styling
  const renderAnimalCard = (animal) => {
    const isMale = animal.a_type === 'M';
    const genderColor = isMale ? '#1e88e5' : '#d81b60';
    const genderBgColor = isMale ? '#e3f2fd' : '#fce4ec';

    return (
      <View style={[
        styles.animalCard,
        { backgroundColor: genderBgColor }
      ]}>
        <View style={styles.animalHeader}>
          <Text style={[
            styles.animalId,
            { color: genderColor }
          ]}>
            {animal.a_id}
          </Text>
          <Text style={[
            styles.animalGender,
            { color: genderColor }
          ]}>
            {isMale ? '♂ Male' : '♀ Female'}
          </Text>
        </View>
        <View style={styles.animalDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Source:</Text>
            <Text style={styles.detailValue}>{animal.source || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Strain:</Text>
            <Text style={styles.detailValue}>{animal.strain || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Serial:</Text>
            <Text style={styles.detailValue}>{animal.a_srl_num || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{formatDate(animal.source_date)}</Text>
          </View>
        </View>
      </View>
    );
  };

  // Combine animals for single FlatList with section headers
  const animalData = [
    ...(maleAnimals.length > 0 ? [
      { 
        type: 'header', 
        id: 'male-header', 
        label: 'Male Animals', 
        count: maleAnimals.length,
        backgroundColor: '#bbdefb' // Light blue header
      },
      ...maleAnimals.map(animal => ({ ...animal, type: 'animal' }))
    ] : []),
    ...(femaleAnimals.length > 0 ? [
      { 
        type: 'header', 
        id: 'female-header', 
        label: 'Female Animals', 
        count: femaleAnimals.length,
        backgroundColor: '#f8bbd0' // Light pink header
      },
      ...femaleAnimals.map(animal => ({ ...animal, type: 'animal' }))
    ] : [])
  ];

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return (
        <View style={[
          styles.sectionHeaderContainer,
          { backgroundColor: item.backgroundColor }
        ]}>
          <Text style={styles.sectionHeaderText}>
            {item.label} ({item.count})
          </Text>
        </View>
      );
    }
    return renderAnimalCard(item);
  };

  return (
    <View style={styles.container}>
      <HeaderComponent headerTitle="Animal Details" onBackPress={() => router.back()} />

      <DetailHeader
        projectTitle={projectTitle}
        groupType={group?.study_type}
        doseDetail={group?.dose_detail}
        speciesType={speciesName}
        totalAnimals={totalAnimals}
      />

      {totalAnimals === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No animals assigned to this group</Text>
        </View>
      ) : (
        <FlatList
          data={animalData}
          keyExtractor={(item) => item.id || item.a_id}
          renderItem={renderItem}
          contentContainerStyle={styles.contentContainer}
          style={styles.scrollContainer}
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
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionHeaderContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  animalCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  animalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 8,
  },
  animalId: {
    fontSize: 16,
    fontWeight: '600',
  },
  animalGender: {
    fontSize: 14,
    fontWeight: '500',
  },
  animalDetails: {
    flexDirection: 'column',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
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
    color: '#666',
  },
});

export default AnimalDetails;