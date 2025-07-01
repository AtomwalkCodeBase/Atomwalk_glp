import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styled from 'styled-components/native';

const ModalBackdrop = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.6);
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
  background-color: #FF3B30;
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
  background-color: #FF3B30;
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

const ErrorModal = ({ visible, message, onClose }) => {
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
            <MaterialIcons name="error-outline" size={36} color="white" />
          </IconCircle>
          
          <Title>Error!</Title>
          <Message>{message || "Something went wrong. Please try again."}</Message>
          
          <ActionButton onPress={onClose}>
            <ButtonText>Close</ButtonText>
          </ActionButton>
        </ModalContent>
      </ModalBackdrop>
    </Modal>
  );
};

export default ErrorModal;