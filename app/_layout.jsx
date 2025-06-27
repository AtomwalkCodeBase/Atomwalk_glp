import { Stack } from "expo-router";
import {AppProvider} from '../context/AppContext';
import { ProjectProvider } from '../context/ProjectContext';

export default function RootLayout() {
  return (
    <AppProvider>
      <ProjectProvider>
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
      {/* <Stack.Screen name="BookmarkScreen/index" options={{headerShown:false}}/> */}
      <Stack.Screen name="ProjectList/index" options={{headerShown:false}}/>
      <Stack.Screen name="GroupList/index" options={{headerShown:false}}/>
      <Stack.Screen name="TestList/index" options={{headerShown:false}}/>
      <Stack.Screen name="TestDetail/index" options={{headerShown:false}}/>
      <Stack.Screen name="ProjectDashboard/index" options={{headerShown:false}}/>
      <Stack.Screen name="StudyResult/index" options={{headerShown:false}}/>
      <Stack.Screen name="CaptureData/index" options={{headerShown:false}}/>
      <Stack.Screen name="AnimalDetails/index" options={{headerShown:false}}/>
    </Stack>
    </ProjectProvider>
    </AppProvider>
  );
}
