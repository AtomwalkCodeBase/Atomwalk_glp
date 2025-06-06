import { Stack } from "expo-router";
import {AppProvider} from '../context/AppContext'

export default function RootLayout() {
  return (
    <AppProvider>
    <Stack>
      <Stack.Screen name="index"/>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      <Stack.Screen name="AuthScreen/index" options={{headerShown:false}}/> 
      <Stack.Screen name="PinScreen/index" options={{headerShown:false}}/> 
      <Stack.Screen name="ResetPassword/index" options={{headerShown:false}}/>
      <Stack.Screen name="ActivityList/index" options={{headerShown:false}}/>
      <Stack.Screen name="OverDue/index" options={{headerShown:false}}/>
      <Stack.Screen name="InventoryData/index" options={{headerShown:false}}/>
      <Stack.Screen name="QcData/index" options={{headerShown:false}}/>
      <Stack.Screen name="ActivityCompleted/index" options={{headerShown:false}}/>
      <Stack.Screen name="MarkCompleteScreen/index" options={{headerShown:false}}/>
      <Stack.Screen name="Test/index" options={{headerShown:false}}/>
      <Stack.Screen name="LabActivity/index" options={{headerShown:false}}/>
      <Stack.Screen name="CameraScreen/index" options={{headerShown:false}}/>
      <Stack.Screen name="AnalysisScreen/index" options={{headerShown:false}}/>
    </Stack>
    </AppProvider>
  );
}
