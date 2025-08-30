import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './constants/types';
import LandingScreen from './app/screens/LandingScreen';
import LoginScreen from './app/screens/LoginScreen';
import SignupScreen from './app/screens/SignupScreen';
import HomeScreen from './app/screens/HomeScreen';
import ResultScreen from './app/screens/ResultScreen';
import SettingsScreen from './app/screens/SettingsScreen';
import BottomTabs from './tabs/BottomTabs';
import EducationScreen from './app/screens/EducationScreen';
import UploadImageScreen from './app/screens/UploadImageScreen';
import PrivacyPolicy from './app/screens/PrivacyPolicy';
import TermsofService from './app/screens/TermsofService';
import HelpCenter from './app/screens/HelpCenter';
import RulesScreen from './app/screens/RulesScreen';
import NotificationScreen from './app/screens/NotificationScreen';
import PreferencesScreen from './app/screens/PreferencesScreen';
import ChangePass from './app/screens/ChangePass';
import PersonalInfoScreen from './app/screens/PersonalInfoScreen';
import ProfileScreen from './app/screens/ProfileScreen';
import HistoryScreen from './app/screens/HistoryScreen';
import EditProfile from './app/screens/EditProfile';
import SymptomCheckScreen from './app/screens/SymptomCheckScreen';
import { ThemeProvider } from './constants/ThemeContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ThemeProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={BottomTabs} />
        <Stack.Screen name="SignUp" component={SignupScreen} />
        <Stack.Screen name='Rules' component={RulesScreen} options={{ headerShown: true }}/>
        <Stack.Screen name="Result" component={ResultScreen} options={{ headerShown: true }}/>
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Education" component={EducationScreen} />
        <Stack.Screen name="Upload" component={UploadImageScreen} />
        <Stack.Screen name="Notification" component={NotificationScreen} options={{ headerShown: true }} />
        <Stack.Screen name="Preferences" component={PreferencesScreen} options={{ headerShown: true }}/>
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} options={{ headerShown: true, headerTitle: '' }}/>
        <Stack.Screen name="TermsofService" component={TermsofService} options={{ headerShown: true, headerTitle: '' }}/>
        <Stack.Screen name="HelpCenter" component={HelpCenter} options={{ headerShown: true, headerTitle: '' }}/>
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true }}/>
        <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} options={{ headerShown: true, headerTitle: '' }}/>
        <Stack.Screen name="ChangePass" component={ChangePass} options={{ headerShown: true, headerTitle: '' }}/>
        <Stack.Screen name="Symptoms" component={SymptomCheckScreen}options={{ headerShown: true }}/>
        <Stack.Screen name="History" component={HistoryScreen} options={{ headerShown: true }}/>
        <Stack.Screen name="EditProfile" component={EditProfile} />
      </Stack.Navigator>
    </NavigationContainer>
    </ThemeProvider>
  );
}
