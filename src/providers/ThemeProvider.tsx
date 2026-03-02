import React from 'react';
import { useColorScheme } from 'react-native';
import { ThemeContext, RNTheme } from './ThemeContext';
import { almadarLight, almadarDark } from '../themes';

export { RNTheme } from './ThemeContext';

export interface ThemeProviderProps {
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
  // Theme state - currently using effectiveTheme memo instead
  // const [currentTheme, setCurrentTheme] = useState<RNTheme>(customTheme || defaultTheme);

  // Determine effective theme based on setting and system
  const effectiveTheme = React.useMemo(() => {
    if (customTheme) return customTheme;
    
    if (theme === 'system') {
      return systemColorScheme === 'dark' ? almadarDark : almadarLight;
    }
    
    return theme === 'dark' ? almadarDark : almadarLight;
  }, [theme, systemColorScheme, customTheme]);



  const value = React.useMemo(() => effectiveTheme, [effectiveTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
