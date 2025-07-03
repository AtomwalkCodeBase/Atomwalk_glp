import React, { useEffect, useState } from 'react';
import { Dimensions, Alert, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import HeaderComponent from '../components/HeaderComponent';
import { LinearGradient } from 'expo-linear-gradient';
import { getActivitiQcData, postActivtyInventory } from '../services/productServices';
import { colors } from '../Styles/appStyle';
import SubmitButton from '../components/SubmitButton';
import AmountInput from '../components/AmountInput';
import SuccessModal from '../components/SuccessModal';
import EmptyMessage from '../components/EmptyMessage';

const { width } = Dimensions.get('window');

// Gradient Background Component
const GradientBackground = styled.View`
  background-color: #f8fffe;
  flex: 1;
  align-items: center;
  height: 100%;
`;

// Main Container for the screen
const Container = styled(ScrollView).attrs({
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,
})`
  padding: 15px;
  height: 100%;
`;

// Title Text
const Title = styled.Text`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 10px;
`;

// Card Component for each inventory item
const Card = styled.View`
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 15px;
  padding: 15px;
  border: 1px solid #ddd;
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 4px;
  elevation: 3;
  width: 100%;
`;

// Row component to align items horizontally
const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

// Bold Text Style
const BoldText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${(props) => (props.callType === 'INV_IN' ? 'red' : 'green')};
`;

// Sub Text Style for additional info
const SubText = styled.Text`
  font-size: 14px;
  color: #555;
  margin-top: 5px;
`;

// Row for headings
const HeadingRow = styled.View`
  border-bottom-width: 0.5px;
  border-bottom-color: black;
  padding: 2px;
`;

// Input Row for quantity input
const InputRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  margin-top: 10px;
`;

// Unit Text Style
const UnitText = styled.Text`
  font-size: 14px;
  color: #555;
  margin-right: 10px;
`;

const InventoryUpdate = (props) => {
  const id = props.id;
  const call_type = props.type;
  const navigation = useNavigation();
  const [inventoryData, setInventoryData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchInventoryData();
  }, []);

  // Fetch inventory data from the API
  const fetchInventoryData = async () => {
    try {
      const data = { activity_id: id, call_mode: 'INV_IN' };
      const response = await getActivitiQcData(data);
      setInventoryData(response.data);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    }
  };

  // Handle change in input value for each inventory item
  const handleInputChange = (itemNumber, value) => {
    const sanitizedValue = value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');

    const updatedData = inventoryData.map((item) =>
      item.item_number === itemNumber
        ? { ...item, curr_consumed_quantity: sanitizedValue }
        : item
    );

    setInventoryData(updatedData);
  };

  // Handle the inventory update for all items
  const handleUpdateAllItems = async () => {
    const flowType = call_type === 'INV_IN' ? 'C' : 'P';
    const itemsToUpdate = inventoryData.filter(item => item.flow_type === flowType && item.curr_consumed_quantity > 0);

    if (call_type === 'INV_IN') {
      for (let item of itemsToUpdate) {
        const alreadyConsumed = parseFloat(item.already_consumed_qty) || 0;
        const currentConsumed = parseFloat(item.curr_consumed_quantity) || 0;
        const allocatedQty = parseFloat(item.allocated_qty) || 0;

        const totalConsumed = alreadyConsumed + currentConsumed;

        if (totalConsumed > allocatedQty) {
          Alert.alert(
            'Error',
            `Entered consumption for ${item.item_name} exceeds allocated quantity. Allocated: ${allocatedQty} ${item.item_base_unit}, Already Consumed: ${alreadyConsumed} ${item.item_base_unit}.`
          );
          return;
        }
      }
    }

    const item_list = itemsToUpdate.map(item => ({
      curr_quantity: `${item.curr_consumed_quantity}`,
      item_number: item.item_number,
    }));

    if (item_list.length === 0) {
      Alert.alert('No Items to Update', 'Please enter valid quantities for at least one item.');
      return;
    }

    const payload = {
      activity_id: id,
      call_mode: call_type,
      item_list,
    };

    try {
      const res = await postActivtyInventory(payload);
      setSuccessMessage('Inventory updated successfully for all items!');
      setModalVisible(true);
      fetchInventoryData();
    } catch (error) {
      console.error('Error updating inventory:', error);
      Alert.alert('Error', 'Failed to update inventory. Please try again later.');
    }
  };

  const filteredData = inventoryData.filter((item) =>
    call_type === 'INV_IN' ? item.flow_type === 'C' : item.flow_type === 'P'
  );

  return (
    <GradientBackground>
      <HeaderComponent headerTitle={call_type === 'INV_IN' ? 'Consumption Items' : 'Production Items'} onBackPress={navigation.goBack} />
      <Container>
        {filteredData.length === 0 ? (
          <EmptyMessage data={call_type === 'INV_IN' ? 'Consumption Items' : 'Production Items'} />
        ) : (
          filteredData.map((item, index) => (
            <Card key={index}>
              <HeadingRow>
                <Row>
                  <BoldText callType={call_type}>
                    {item.item_number} [{item.item_name}]
                  </BoldText>
                </Row>
                {item.flow_type === 'C' && (
                  <>
                    <SubText>Batch: {item.bin_location || item.batch_number || 'N/A'}</SubText>
                    <SubText>Allocated Qty: {item.allocated_qty} {item.item_base_unit}</SubText>
                  </>
                )}
              </HeadingRow>
              <SubText>
                {item.flow_type === 'C' 
                  ? `Already Consumed Qty: ${item.already_consumed_qty} ${item.item_base_unit}` 
                  : `Estimated Qty: ${item.estimated_qty || 'N/A'} ${item.item_base_unit}`}
              </SubText>
              <SubText>
                {item.flow_type === 'C' 
                  ? `Released & Wastage: ${item.released_qty} ${item.item_base_unit} & ${item.wastage_qty} ${item.item_base_unit}` 
                  : `Produced Qty: ${item.already_consumed_qty || 'N/A'} ${item.item_base_unit}`}
              </SubText>
              <InputRow>
                <AmountInput
                  label="Quantity"
                  claimAmount={String(item.curr_consumed_quantity || '')}
                  setClaimAmount={(value) => handleInputChange(item.item_number, value)}
                />
                <UnitText>{item.item_base_unit}</UnitText>
              </InputRow>
            </Card>
          ))
        )}

        {filteredData.length > 0 && (call_type === 'INV_IN' || call_type === 'INV_OUT') && (
          <SubmitButton
            label={call_type === 'INV_IN' ? 'Update Consumption' : 'Update Production'}
            onPress={handleUpdateAllItems}
            bgColor={colors.primary}
            textColor="white"
          />
        )}
      </Container>

      <SuccessModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        message={successMessage}
      />
    </GradientBackground>
  );
};

export default InventoryUpdate;
