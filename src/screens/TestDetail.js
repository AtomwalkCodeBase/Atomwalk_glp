import { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import CaptureDataModal from '../components/CaptureDataModal';
import TestList2 from './TestList2';
import HeaderComponent from '../components/HeaderComponent';
import { ProjectContext } from '../../context/ProjectContext';

const TestDetail = () => {
  const { selectedProjectRef } = useContext(ProjectContext);
  const { ref_num, group, test } = useLocalSearchParams();
  const router = useRouter();

  // Parse the stringified JSON data
  const selectedTest = JSON.parse(test);
  const selectedGroup = JSON.parse(group);

  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Generate animal data based on group data
  const generateAnimalData = () => {
    const { no_of_male, no_of_female, species_type } = selectedGroup;
    const totalAnimals = (no_of_male || 0) + (no_of_female || 0);
    const animals = [];

    // Generate male animals
    for (let i = 1; i <= no_of_male; i++) {
      animals.push({
        id: `${species_type}${i}`,
        gender: 'Male',
        completed: false, // Placeholder until API provides completion status
      });
    }

    // Generate female animals
    for (let i = 1; i <= no_of_female; i++) {
      animals.push({
        id: `${species_type}${i + no_of_male}`,
        gender: 'Female',
        completed: false, // Placeholder until API provides completion status
      });
    }

    return animals;
  };

  const animalData = generateAnimalData();
  const totalAnimals = animalData.length;
  const completedCount = animalData.filter((animal) => animal.completed).length;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#22c55e';
      case 'In Progress':
        return '#f59e0b';
      case 'Pending':
        return '#6b7280';
      case 'Not Started':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const handleAnimalClick = (animal) => {
    setSelectedAnimal(animal);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <HeaderComponent headerTitle="Test Detail" onBackPress={() => router.back()} />
      <View style={styles.sectionHeader}>
        <Text style={styles.title}>Project: {ref_num}</Text>
        <Text style={styles.title}>Group: {selectedGroup.name}</Text>
        <Text style={styles.title}>Test Name: {selectedTest.name}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Test Info */}
        <View style={styles.testInfoCard}>
          <Text style={styles.infoLabel}>Frequency</Text>
          <Text style={styles.infoValue}>{selectedTest.test_frequency_display}</Text>
          <Text style={styles.infoLabel}>Status</Text>
          <Text style={[styles.infoValue, { color: getStatusColor('Pending') }]}>Pending</Text>
          <Text style={styles.infoLabel}>Progress</Text>
          <Text style={styles.infoValue}>
            {completedCount}/{totalAnimals} subjects completed
          </Text>
        </View>

        {/* Animals Section */}
        <View style={styles.animalsContainer}>
          <Text style={styles.sectionTitle}>
            Test Subjects ({completedCount}/{totalAnimals} completed)
          </Text>
          <View style={styles.animalsGrid}>
            {animalData.map((animal) => (
              <TouchableOpacity
                key={animal.id}
                style={[
                  styles.animalCard,
                  { backgroundColor: animal.completed ? '#dcfce7' : '#fef2f2' },
                ]}
                onPress={() => handleAnimalClick(animal)}
              >
                <Text style={styles.animalId}>{animal.id}</Text>
                <Text style={styles.animalGender}>{animal.gender}</Text>
                <View
                  style={[
                    styles.completionBadge,
                    { backgroundColor: animal.completed ? '#22c55e' : '#dc2626' },
                  ]}
                >
                  <Text style={styles.completionText}>
                    {animal.completed ? 'Complete' : 'Pending'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* <TestList2 /> */}
      </ScrollView>

      {/* Modal */}
      <CaptureDataModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedAnimal={selectedAnimal}
        selectedTest={selectedTest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 4,
  },
  testInfoCard: {
    margin: 10,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
    marginTop: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  animalsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  animalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  animalCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  animalId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  animalGender: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  completionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TestDetail;