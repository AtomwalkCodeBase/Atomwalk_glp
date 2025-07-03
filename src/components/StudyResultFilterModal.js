import React from 'react';
import { Modal, TouchableOpacity, View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DropdownPicker from './DropdownPicker';
import DatePicker from './DatePicker';

const FilterModal = ({
  visible,
  onClose,
  filters,
  setFilters,
  groups,
  tests,
  clearFilters,
  currentDate,
  minDate = undefined, 
  maxDate = undefined
}) => {
  const [tempFilters, setTempFilters] = React.useState(filters);

  React.useEffect(() => {
    if (visible) {
      setTempFilters(filters);
    }
  }, [visible, filters]);

  const handleApply = () => {
    setFilters(tempFilters);
    onClose();
  };

   const handleClear = () => {
    const defaultFilters = {
      startDate: currentDate,
      group: 'All',
      test: 'All'
    };
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        activeOpacity={1}
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContent}
          onPress={() => {}}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Tests</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Date</Text>
              <DatePicker
                label="Select Date"
                cDate={tempFilters.startDate}
                setCDate={(value) => setTempFilters(prev => ({ ...prev, startDate: value }))}
                minDate={minDate} // Will be undefined if not provided
                maxDate={maxDate} // Will be undefined if not provided
              />
            </View>
            <View style={styles.formGroup}>
              <DropdownPicker
                label="Group"
                data={[
                  { label: 'All', value: 'All' },
                  ...groups.map((group) => ({
                    label: group.study_type,
                    value: group.study_type,
                  })),
                ]}
                value={tempFilters.group}
                setValue={(value) => setTempFilters(prev => ({ ...prev, group: value }))}
              />
            </View>
            <View style={styles.formGroup}>
              <DropdownPicker
                label="Test"
                data={[
                  { label: 'All', value: 'All' },
                  ...tests.map((test) => ({
                    label: test,
                    value: test,
                  })),
                ]}
                value={tempFilters.test}
                setValue={(value) => setTempFilters(prev => ({ ...prev, test: value }))}
              />
            </View>
            <View style={styles.filterButtons}>
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={ handleClear}
              >
                <Text style={styles.clearButtonText}>Clear Filters</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton} 
                onPress={handleApply}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: 600,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  formGroup: {
    marginBottom: 10,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  clearButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#088f8f',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  clearButtonText: {
    color: '#088f8f',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#088f8f',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FilterModal;