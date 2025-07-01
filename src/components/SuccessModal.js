import { useEffect } from 'react';
import { Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styled from 'styled-components/native';

const ModalBackdrop = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.View`
  width: 85%;
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 4px;
  elevation: 5;
`;

const IconCircle = styled.View`
  width: 72px;
  height: 72px;
  border-radius: 36px;
  background-color: #4CAF50;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: #2D3748;
  margin-bottom: 8px;
  text-align: center;
`;

const Message = styled.Text`
  font-size: 16px;
  color: #718096;
  text-align: center;
  margin-bottom: 24px;
  line-height: 24px;
`;

const ActionButton = styled.TouchableOpacity`
  background-color: #4CAF50;
  padding: 12px 24px;
  border-radius: 6px;
  width: 100%;
  align-items: center;
`;

const ButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: 500;
`;

const SuccessModal = ({ visible, onClose,onAutoClose, autoCloseDelay = 3000, message }) => {
  useEffect(() => {
    if (visible && onAutoClose) {
      const timer = setTimeout(() => {
        onAutoClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [visible, onAutoClose, autoCloseDelay]);
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <ModalBackdrop>
        <ModalContent>
          <IconCircle>
            <MaterialIcons name="check" size={36} color="white" />
          </IconCircle>

          <Title>Success!</Title>
          <Message>{message || "Your action was completed successfully."}</Message>

          <ActionButton onPress={onClose}>
            <ButtonText>Close</ButtonText>
          </ActionButton>
        </ModalContent>
      </ModalBackdrop>
    </Modal>
  );
};

export default SuccessModal;