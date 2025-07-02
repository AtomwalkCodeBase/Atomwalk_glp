import { StyleSheet, View } from 'react-native'
// import LabBooking from '../../src/screens/LabBooking';
import EquipmentBooking from '../../src/screens/EquipmentBookingDemo'

const booking = () => {
    return (
        <View style={{ flex: 1 }}>
            {/* <LabBooking /> */}
            <EquipmentBooking/>
        </View>
    )
}

export default booking

const styles = StyleSheet.create({})