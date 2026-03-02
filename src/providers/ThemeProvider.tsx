import React, { useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeContext, RNTheme, defaultTheme } from './ThemeContext';
import { almadarLight, almadarDark } from '../themes';

export { RNTheme } from './ThemeContext';

interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark' | 'system';
  customTheme?: RNTheme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  theme = 'system',
  customTheme,
}) => {
  const systemColorScheme = useColorScheme();
  const [currentTheme, setCurrentTheme] = useState<RNTheme>(customTheme || defaultTheme);

  // Determine effective theme based on setting and system
  const effectiveTheme = React.useMemo(() => {
    if (customTheme) return customTheme;
    
    if (theme === 'system') {
      return systemColorScheme === 'dark' ? almadarDark : almadarLight;
    }
    
    return theme === 'dark' ? almadarDark : almadarLight;
  }, [theme, systemColorScheme, customTheme]);

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setCurrentTheme(newTheme === 'dark' ? almadarDark : almadarLight);
  }, []);

  const value = React.useMemo(() => effectiveTheme, [effectiveTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
