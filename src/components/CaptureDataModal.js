import React from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const CaptureDataModal = ({
  visible,
  ratId,
  subTypes,
  units,
  normalRanges,
  data,
  onDataChange,
  onSubmit,
  onClose,
  isDisabled,
}) => {
  const filledFields = Object.values(data).filter(v => v.trim() !== '').length;
  const totalFields = subTypes.length;
  const percentage = (filledFields / totalFields) * 100;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Enter Data for {ratId}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          <ScrollView
            style={styles.measurementsContainer}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.measurementsContent}
          >
            {subTypes.map((subType, index) => (
              <View key={subType} style={styles.measurementRow}>
                <View style={styles.fieldInfo}>
                  <Text style={styles.fieldLabel}>{subType}</Text>
                  <Text style={styles.normalRange}>
                    {normalRanges[subType]} {units[subType]}
                  </Text>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, isDisabled && styles.disabledInput]}
                    placeholder="Enter value"
                    value={data[subType] || ''}
                    onChangeText={(value) => onDataChange(subType, value)}
                    keyboardType="numeric"
                    editable={!isDisabled}
                    returnKeyType={index === subTypes.length - 1 ? 'done' : 'next'}
                  />
                  <Text style={styles.unit}>{units[subType]}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Submit Button */}
          {!isDisabled && (
            <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          )}
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
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: Math.min(SCREEN_WIDTH * 0.9, 400),
    maxHeight: SCREEN_HEIGHT * 0.7,
    minHeight: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    padding: 6,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#64748b',
  },
  measurementsContainer: {
    paddingHorizontal: 16,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 4,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  fieldInfo: {
    flex: 1,
    marginRight: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  normalRange: {
    fontSize: 12,
    color: '#64748b',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    minWidth: 180,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 15,
    textAlign: 'left',
  },
  disabledInput: {
    opacity: 0.5,
  },
  unit: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CaptureDataModal;