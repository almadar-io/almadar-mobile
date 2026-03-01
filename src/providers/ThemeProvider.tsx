import React from 'react';
import { ThemeContext, defaultTheme as defaultRNTheme, RNTheme } from './ThemeContext';

export interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: RNTheme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  theme = defaultRNTheme 
}) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Re-export useTheme
export { useTheme } from './ThemeContext';
export type { RNTheme } from './ThemeContext';
