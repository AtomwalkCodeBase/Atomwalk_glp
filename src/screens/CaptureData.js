import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Dropdown } from 'react-native-element-dropdown';
import HeaderComponent from '../components/HeaderComponent';
import { ProjectContext } from '../../context/ProjectContext';
import CaptureDataModal from '../components/CaptureDataModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const testConfigs = [
  {
    test_type: 'Clinical Sign',
    type: 'dropdown',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Lethargic', value: 'lethargic' },
      { label: 'Hunched posture', value: 'Hunched posture' },
    ],
    defaultValue: 'active',
    unit: null,
  },
  {
    test_type: 'Weight',
    type: 'input',
    unit: 'g',
  },
  {
    test_sub_type: 'blood',
    type: 'sub_type',
    sub_types: ['Haemoglobin', 'WBC', 'RBC', 'Platelets'],
    units: {
      Haemoglobin: 'g/dL',
      WBC: 'thousands/µL',
      RBC: 'millions/µL',
      Platelets: 'thousands/µL',
    },
    normalRanges: {
      Haemoglobin: '12-18',
      WBC: '3-10',
      RBC: '4-6',
      Platelets: '150-450',
    },
  },
];

const CaptureData = () => {
  const { projectTitle, groupId: initialGroupId, groupName: initialGroupName, test: testString, scheduleDate, isCompleted, selectedTab, selectedTest, selectedGroup } = useLocalSearchParams();
  const isViewOnly = isCompleted === 'true';
  const router = useRouter();
  const { groupsByProject, generateRatIds, saveCapturedData, getCapturedData } = useContext(ProjectContext);
  const test = JSON.parse(testString);
  const groups = groupsByProject[test.project_code] || [];
  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId || groups[0]?.group_id);
  const group = groups.find(g => g.group_id === selectedGroupId);
  const rats = group ? generateRatIds(group) : [];

  const testType = test.test_type || null;
  const testSubType = test.test_sub_type || null;
  const effectiveTestType = testType === 'Weight' ? 'Weight' : testType;

  const testConfig = testConfigs.find(config => {
    if (effectiveTestType) return config.test_type === effectiveTestType;
    if (testSubType === 'blood') return config.test_sub_type === 'blood';
    return false;
  }) || {
    type: 'input',
    unit: test.test_unit || '',
  };

  const subTypesForModal = testConfig.type === 'sub_type' ? testConfig.sub_types : [];
  const unitsForModal = testConfig.type === 'sub_type' ? testConfig.units : {};
  const normalRangesForModal = testConfig.type === 'sub_type' ? testConfig.normalRanges : {};

  const [dataEntries, setDataEntries] = useState(
    rats.reduce((acc, ratId) => {
      const savedData = getCapturedData(test.project_code, selectedGroupId, test.id, ratId, scheduleDate);
      return {
        ...acc,
        [ratId]: savedData || (testConfig.type === 'sub_type' ? 
          subTypesForModal.reduce((subAcc, subType) => ({ ...subAcc, [subType]: '' }), {}) : 
          testConfig.type === 'dropdown' ? testConfig.defaultValue : ''),
      };
    }, {})
  );

  const [editMode, setEditMode] = useState(
    rats.reduce((acc, ratId) => ({ ...acc, [ratId]: false }), {})
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRat, setSelectedRat] = useState(null);

  useEffect(() => {
    const newRats = group ? generateRatIds(group) : [];
    setDataEntries(
      newRats.reduce((acc, ratId) => {
        const savedData = getCapturedData(test.project_code, selectedGroupId, test.id, ratId, scheduleDate);
        return {
          ...acc,
          [ratId]: savedData || (testConfig.type === 'sub_type' ? 
            subTypesForModal.reduce((subAcc, subType) => ({ ...subAcc, [subType]: '' }), {}) : 
            testConfig.type === 'dropdown' ? testConfig.defaultValue : ''),
        };
      }, {})
    );
    setEditMode(newRats.reduce((acc, ratId) => ({ ...acc, [ratId]: false }), {}));
  }, [selectedGroupId, test.project_code, test.id, scheduleDate]);

  const handleDataChange = (ratId, field, value) => {
    setDataEntries(prev => ({
      ...prev,
      [ratId]: testConfig.type === 'sub_type' ? 
        { ...prev[ratId], [field]: value } : 
        value,
    }));
  };

  const toggleEditMode = (ratId) => {
    setEditMode(prev => ({ ...prev, [ratId]: !prev[ratId] }));
  };

  const handleSubmit = () => {
    rats.forEach(ratId => {
      const data = dataEntries[ratId];
      if (data && (testConfig.type === 'sub_type' ? Object.values(data).some(v => v !== '') : data !== '')) {
        console.log(`Saving data for ${ratId}:`, data);
        saveCapturedData(test.project_code, selectedGroupId, test.id, ratId, scheduleDate, data);
        setEditMode(prev => ({ ...prev, [ratId]: false }));
      }
    });
    router.back();
  };

  const handleCaptureData = (ratId) => {
    setSelectedRat(ratId);
    setModalVisible(true);
  };

  const handleModalSubmit = (ratId) => {
    if (ratId && testConfig.type === 'sub_type') {
      const data = dataEntries[ratId];
      if (Object.values(data).some(v => v !== '')) {
        console.log(`Saving modal data for ${ratId}:`, data);
        saveCapturedData(test.project_code, selectedGroupId, test.id, ratId, scheduleDate, data);
      }
    }
    setModalVisible(false);
    setSelectedRat(null);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedRat(null);
  };

  const getSubTypeProgress = (ratId) => {
    if (testConfig.type !== 'sub_type') return null;
    const data = dataEntries[ratId];
    const completed = Object.values(data).filter(v => v !== '').length;
    const total = subTypesForModal.length;
    return `${completed}/${total} completed`;
  };

  if (!group || rats.length === 0) {
    return (
      <View style={styles.container}>
        <HeaderComponent headerTitle="Capture Data" onBackPress={() => router.back()} />
        <View style={styles.headerSection}>
          <Text style={styles.headerText}>Project: {projectTitle}</Text>
          <Text style={styles.headerText}>Group: {initialGroupName || 'Unknown'}</Text>
          <Text style={styles.headerText}>Test: {test.name}</Text>
          <Text style={styles.headerText}>Schedule Date: {scheduleDate}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Group or rats not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderComponent headerTitle="Capture Data" onBackPress={() => router.back()} />
      <View style={styles.headerSection}>
        <Text style={styles.headerText}>Project: {projectTitle}</Text>
        <Text style={styles.headerText}>Test: {test.name}</Text>
        <Text style={styles.headerText}>Species: {group.species_type}</Text>
        <Text style={styles.headerText}>Schedule Date: {scheduleDate}</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        {testConfig.type !== 'sub_type' ? (
          <>
            {!isViewOnly && testConfig.type === 'dropdown' && (
              <TouchableOpacity
                style={styles.markAllButton}
                onPress={() => {
                  const newEntries = { ...dataEntries };
                  rats.forEach(ratId => {
                    if (!getCapturedData(test.project_code, selectedGroupId, test.id, ratId, scheduleDate)) {
                      newEntries[ratId] = testConfig.defaultValue;
                    }
                  });
                  setDataEntries(newEntries);
                }}
              >
                <Text style={styles.markAllButtonText}>Mark All as {testConfig.defaultValue}</Text>
              </TouchableOpacity>
            )}
            <View style={styles.ratsContainer}>
              {rats.map(ratId => {
                const isDisabled = isViewOnly || (!!getCapturedData(test.project_code, selectedGroupId, test.id, ratId, scheduleDate) && !editMode[ratId]);
                return (
                  <View key={ratId} style={styles.ratRow}>
                    <Text style={styles.ratName}>{ratId}</Text>
                    {testConfig.type === 'dropdown' ? (
                      <View style={styles.inputContainer}>
                        <Dropdown
                          style={[styles.dropdown, isDisabled && styles.disabledInput]}
                          containerStyle={styles.dropdownContainer}
                          itemTextStyle={styles.dropdownItemText}
                          placeholderStyle={styles.dropdownPlaceholder}
                          selectedTextStyle={styles.dropdownSelectedText}
                          data={testConfig.options}
                          labelField="label"
                          valueField="value"
                          value={dataEntries[ratId] || ''}
                          onChange={item => handleDataChange(ratId, effectiveTestType, item.value)}
                          placeholder="Select..."
                          maxHeight={150}
                          disable={isDisabled}
                        />
                        {!isViewOnly && isDisabled && (
                          <TouchableOpacity style={styles.editButton} onPress={() => toggleEditMode(ratId)}>
                            <Text style={styles.editButtonText}>Edit</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ) : (
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={[styles.input, isDisabled && styles.disabledInput]}
                          value={dataEntries[ratId]}
                          onChangeText={value => handleDataChange(ratId, effectiveTestType, value)}
                          placeholder={`Enter Value`}
                          keyboardType="numeric"
                          editable={!isDisabled}
                        />
                        <Text style={styles.unit}>{testConfig.unit}</Text>
                        {!isViewOnly && isDisabled && (
                          <TouchableOpacity style={styles.editButton} onPress={() => toggleEditMode(ratId)}>
                            <Text style={styles.editButtonText}>Edit</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
            {!isViewOnly && (
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.ratsContainer}>
            {rats.map(ratId => {
              const isDisabled = isViewOnly || (!!getCapturedData(test.project_code, selectedGroupId, test.id, ratId, scheduleDate) && !editMode[ratId]);
              const progress = getSubTypeProgress(ratId);
              return (
                <View key={ratId} style={styles.ratRow}>
                  <View style={styles.ratInfo}>
                    <Text style={styles.ratName}>{ratId}</Text>
                    {progress && <Text style={styles.progressText}>{progress}</Text>}
                  </View>
                  <View style={styles.buttonContainer}>
                    {!isViewOnly && (
                      <TouchableOpacity
                        style={[styles.captureButton, isDisabled && styles.disabledButton]}
                        onPress={() => handleCaptureData(ratId)}
                        disabled={isDisabled}
                      >
                        <Text style={styles.captureButtonText}>Capture Data</Text>
                      </TouchableOpacity>
                    )}
                    {!isViewOnly && isDisabled && (
                      <TouchableOpacity style={styles.editButton} onPress={() => toggleEditMode(ratId)}>
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
      {testConfig.type === 'sub_type' && selectedRat && (
        <CaptureDataModal
          visible={modalVisible}
          ratId={selectedRat}
          subTypes={subTypesForModal}
          units={unitsForModal}
          normalRanges={normalRangesForModal}
          data={dataEntries[selectedRat] || {}}
          onDataChange={(subType, value) => handleDataChange(selectedRat, subType, value)}
          onSubmit={() => handleModalSubmit(selectedRat)}
          onClose={handleModalClose}
          isDisabled={isViewOnly || (getCapturedData(test.project_code, selectedGroupId, test.id, selectedRat, scheduleDate) && !editMode[selectedRat])}
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
  scrollView: {
    flex: 1,
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
  ratsContainer: {
    padding: 15,
  },
  ratRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  ratInfo: {
    flex: 1,
    marginRight: 10,
  },
  ratName: {
    fontSize: 16,
    color: '#333',
    marginRight: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 5,
    padding: 8,
    flex: 1,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  disabledInput: {
    opacity: 0.5,
  },
  unit: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  captureButton: {
    backgroundColor: '#0288d1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  markAllButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 10,
  },
  markAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#0288d1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    margin: 15,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 5,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  dropdown: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 5,
    padding: 8,
    flex: 1,
    fontSize: 14,
    backgroundColor: '#fff',
    flexShrink: 1,
    minWidth: 100,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 5,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: '#999',
    numberOfLines: 1,
    ellipsizeMode: 'tail',
  },
  dropdownSelectedText: {
    fontSize: 14,
    color: '#333',
    numberOfLines: 1,
    ellipsizeMode: 'tail',
  },
});

export default CaptureData;