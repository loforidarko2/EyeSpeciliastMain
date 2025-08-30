// context/ThemeContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, ColorScheme } from './Colors';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: typeof Colors.light;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType>({
  mode: 'auto',
  setMode: () => {},
  colors: Colors.light,
  isDark: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('auto');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorScheme | null>(
    Appearance.getColorScheme() as ColorScheme
  );

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('themeMode');
        if (savedMode && ['light', 'dark', 'auto'].includes(savedMode)) {
          setMode(savedMode as ThemeMode);
        }
      } catch (error) {
        console.log('Error loading theme preference:', error);
      }
    };
    loadThemePreference();
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme as ColorScheme);
    });
    return () => subscription?.remove();
  }, []);

  const handleSetMode = async (newMode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('themeMode', newMode);
      setMode(newMode);
    } catch (error) {
      console.log('Error saving theme preference:', error);
      setMode(newMode);
    }
  };

  const getCurrentTheme = (): ColorScheme => {
    if (mode === 'auto') {
      return systemColorScheme || 'light';
    }
    return mode as ColorScheme;
  };

  const currentTheme = getCurrentTheme();
  const colors = Colors[currentTheme];
  const isDark = currentTheme === 'dark';

  return (
    <ThemeContext.Provider value={{ 
      mode, 
      setMode: handleSetMode, 
      colors, 
      isDark 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ✅ Hook to use theme values
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
