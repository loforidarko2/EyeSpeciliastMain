import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../app/screens/HomeScreen';
import EducationScreen from '../app/screens/EducationScreen';
import SettingsScreen from '../app/screens/SettingsScreen';
import UploadImageScreen from '../app/screens/UploadImageScreen';
import { BottomTabParamList } from '../constants/types';
import { useTheme } from '../constants/ThemeContext';
import { useThemeColors } from '../constants/Colors';

const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabs: React.FC = () => {
  const {colors} = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          let iconSize = size;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Upload':
              iconName = focused ? 'camera' : 'camera-outline';
              iconSize += 1;
              break;
            case 'Education':
              iconName = focused ? 'book' : 'book-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
          }

          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Upload" component={UploadImageScreen} />
      <Tab.Screen name="Education" component={EducationScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabs;
