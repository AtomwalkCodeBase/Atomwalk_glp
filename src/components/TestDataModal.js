import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Alert, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { RectButton } from '../components/old_components/Button';

const TestDataModal = ({
  visible,
  ratId,
  testName,
  testUnit,
  onClose,
  onSave,
  initialValue = '',
  initialRemarks = ''
}) => {
  const [testValue, setTestValue] = useState(initialValue);
  const [remarks, setRemarks] = useState(initialRemarks);

  useEffect(() => {
    if (visible) {
      setTestValue(initialValue || ''); 
      setRemarks(initialRemarks || '');
    }
  }, [visible, ratId, initialValue, initialRemarks]);


  const handleSave = () => {
    if (!testValue.trim()) {
      Alert.alert('Error', 'Test value cannot be empty.');
      return;
    }
    onSave(testValue, remarks);
  };

  const handleOutsidePress = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#1e293b" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{`Rat: ${ratId}`}</Text>
              <Text style={styles.modalSubtitle}>{`Test: ${testName}`}</Text>
              
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Test Value</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={testValue}
                      onChangeText={setTestValue}
                      placeholder="Enter test value"
                      keyboardType={testUnit === 'g' ? 'numeric' : 'default'}
                    />
                    {testUnit && <Text style={styles.unit}>{testUnit}</Text>}
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Remarks</Text>
                  <TextInput
                    style={[styles.input, styles.remarksInput]}
                    value={remarks}
                    onChangeText={setRemarks}
                    placeholder="Enter remarks"
                    multiline
                  />
                </View>
              </ScrollView>

              <View style={styles.buttonContainer}>
                <RectButton
                  title="Cancel"
                  minWidth={100}
                  backgroundColor="#dc3545"
                  onPress={onClose}
                />
                <RectButton
                  title="Save"
                  minWidth={100}
                  backgroundColor="#22c55e"
                  onPress={handleSave}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%', // Limit modal height
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 20, // Add padding at bottom of scrollable area
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
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
  remarksInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  unit: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default TestDataModal;