import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const CaptureDataModal = ({ visible, onClose, selectedAnimal, selectedTest }) => {
  const [testValues, setTestValues] = useState({}); // Store input values for test_type or test_sub_type

  // Determine test items based on test_sub_type or test_type
  const testItems = selectedTest?.test_sub_type
    ? Array.isArray(selectedTest.test_sub_type)
      ? selectedTest.test_sub_type.map((subtype) => ({ subtype, unit: selectedTest.test_unit }))
      : [{ subtype: selectedTest.test_sub_type, unit: selectedTest.test_unit }]
    : [{ subtype: selectedTest?.test_type, unit: selectedTest.test_unit }];

  const handleInputChange = (key, value) => {
    setTestValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveResult = () => {
    // Placeholder for saving results to API
    console.log('Saving results:', testValues);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          {/* Header with Close Button */}
          <View style={styles.headerContainer}>
            <Text style={styles.modalHeader}>
              {selectedAnimal ? `${selectedAnimal.id} (${selectedAnimal.gender})` : 'No Animal Selected'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#1e293b" />
            </TouchableOpacity>
          </View>

          {/* Horizontal Line */}
          <View style={styles.horizontalLine} />

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {testItems.map((item, index) => (
              <View key={item.subtype || index} style={styles.inputRow}>
                <Text style={styles.inputLabel}>
                  {selectedTest.test_sub_type ? 'Test Subtype' : 'Test Type'}: {item.subtype}
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter value"
                      value={testValues[item.subtype] || ''}
                      onChangeText={(text) => handleInputChange(item.subtype, text)}
                      keyboardType="numeric"
                    />
                    <Text style={styles.unit}>{item.unit}</Text>
                  </View>
                  <TouchableOpacity style={styles.editButton} disabled={true}>
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Save Result Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveResult}>
            <Text style={styles.saveButtonText}>Save Result</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 5,
  },
  horizontalLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 20,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  inputRow: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  unit: {
    fontSize: 16,
    color: '#64748b',
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  editButtonText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default CaptureDataModal;