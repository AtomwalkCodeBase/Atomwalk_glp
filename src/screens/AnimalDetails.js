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

  // Render animal card with modern design
  const renderAnimalCard = (animal, index) => {
    const isMale = animal.a_type === 'M';

    return (
      <View style={styles.animalCard}>
        <View style={styles.cardHeader}>
          <View style={styles.animalBadge}>
            <Text style={styles.animalNumber}>#{String(index + 1).padStart(2, '0')}</Text>
          </View>
          <View style={styles.animalInfo}>
            <View style={styles.animalIdRow}>
              <Text style={styles.animalId}>{animal.a_id}</Text>
              <View style={styles.genderContainer}>
                <Text style={styles.genderIcon}>{isMale ? '♂' : '♀'}</Text>
                <Text style={styles.genderText}>{isMale ? 'Male' : 'Female'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Source</Text>
            <Text style={styles.detailValue}>{animal.source || 'N/A'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Strain</Text>
            <Text style={styles.detailValue}>{animal.strain || 'N/A'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Serial</Text>
            <Text style={styles.detailValue}>{animal.a_srl_num || 'N/A'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Date</Text>
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
        icon: '♂'
      },
      ...maleAnimals.map((animal, index) => ({ ...animal, type: 'animal', displayIndex: index }))
    ] : []),
    ...(femaleAnimals.length > 0 ? [
      {
        type: 'header',
        id: 'female-header',
        label: 'Female Animals',
        count: femaleAnimals.length,
        icon: '♀'
      },
      ...femaleAnimals.map((animal, index) => ({ ...animal, type: 'animal', displayIndex: index }))
    ] : [])
  ];

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>{item.icon}</Text>
            </View>
            <Text style={styles.sectionTitle}>{item.label}</Text>
          </View>
          <View style={styles.sectionCount}>
            <Text style={styles.sectionCountText}>{item.count}</Text>
          </View>
        </View>
      );
    }
    return renderAnimalCard(item, item.displayIndex);
  };

  return (
    <View style={styles.container}>
      <HeaderComponent headerTitle="Animal Details" onBackPress={() => router.back()} />

      <View style={styles.detailHeaderContainer}>
        <DetailHeader
          projectTitle={projectTitle}
          groupType={group?.study_type}
          doseDetail={group?.dose_detail}
          speciesType={speciesName}
          totalAnimals={totalAnimals}
        />
      </View>

      {totalAnimals === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>🔍</Text>
          </View>
          <Text style={styles.emptyTitle}>No Animals Found</Text>
          <Text style={styles.emptyText}>No animals assigned to this group</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlatList
            data={animalData}
            keyExtractor={(item) => item.id || item.a_id}
            renderItem={renderItem}
            contentContainerStyle={styles.contentContainer}
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
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
  
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },

  // Section Header Styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#33B1AF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
    marginTop: 8,
    shadowColor: '#5ed2ce',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2, // Reduced elevation
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    width: 28,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionIconText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  sectionCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },

  animalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8f8f7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2, // Reduced elevation
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  animalBadge: {
    backgroundColor: '#33B1AF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  animalNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  animalInfo: {
    flex: 1,
  },
  animalIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  animalId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    flex: 1,
  },
  genderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderIcon: {
    fontSize: 14,
    color: '#5ed2ce',
    marginRight: 4,
    fontWeight: 'bold',
  },
  genderText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#e8f8f7',
    marginBottom: 12,
  },

  // Details Grid
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#a0aec0',
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    color: '#2d3748',
    fontWeight: '500',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#f0fdfc',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
});

export default AnimalDetails;