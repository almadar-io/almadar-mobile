import React, { createContext, useContext, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeContext, RNTheme } from './ThemeContext';
import { almadarLight, almadarDark } from '../themes';

export { RNTheme } from './ThemeContext';

export interface ThemeModeContextValue {
  mode: 'light' | 'dark' | 'system';
  resolvedMode: 'light' | 'dark';
  toggleMode: () => void;
  setMode: (mode: 'light' | 'dark' | 'system') => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue>({
  mode: 'system',
  resolvedMode: 'light',
  toggleMode: () => {},
  setMode: () => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);

export interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark' | 'system';
  customTheme?: RNTheme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  theme: initialTheme = 'system',
  customTheme,
}) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<'light' | 'dark' | 'system'>(initialTheme);

  const resolvedMode: 'light' | 'dark' = React.useMemo(() => {
    if (mode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  }, [mode, systemColorScheme]);

  const toggleMode = useCallback(() => {
    setMode(prev => {
      if (prev === 'system') {
        return systemColorScheme === 'dark' ? 'light' : 'dark';
      }
      return prev === 'light' ? 'dark' : 'light';
    });
  }, [systemColorScheme]);

  const effectiveTheme = React.useMemo(() => {
    if (customTheme) return customTheme;
    return resolvedMode === 'dark' ? almadarDark : almadarLight;
  }, [customTheme, resolvedMode]);

  const modeValue = React.useMemo<ThemeModeContextValue>(() => ({
    mode,
    resolvedMode,
    toggleMode,
    setMode,
  }), [mode, resolvedMode, toggleMode]);

  return (
    <ThemeModeContext.Provider value={modeValue}>
      <ThemeContext.Provider value={effectiveTheme}>
        {children}
      </ThemeContext.Provider>
    </ThemeModeContext.Provider>
  );
};
