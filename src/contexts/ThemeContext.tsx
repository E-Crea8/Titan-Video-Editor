import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('titan-theme');
    return (saved as Theme) || 'dark';
  });

  const [actualTheme, setActualTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    
    const getSystemTheme = () => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const applyTheme = (newTheme: Theme) => {
      const resolved = newTheme === 'system' ? getSystemTheme() : newTheme;
      setActualTheme(resolved);
      
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
      
      // Update CSS variables for light theme
      if (resolved === 'light') {
        root.style.setProperty('--editor-bg', '#f5f5f7');
        root.style.setProperty('--editor-panel', '#ffffff');
        root.style.setProperty('--editor-surface', '#f0f0f2');
        root.style.setProperty('--editor-border', '#e0e0e5');
        root.style.setProperty('--editor-text', '#1a1a2e');
        root.style.setProperty('--editor-text-muted', '#6b7280');
      } else {
        root.style.setProperty('--editor-bg', '#0d1117');
        root.style.setProperty('--editor-panel', '#161b22');
        root.style.setProperty('--editor-surface', '#21262d');
        root.style.setProperty('--editor-border', '#30363d');
        root.style.setProperty('--editor-text', '#f0f6fc');
        root.style.setProperty('--editor-text-muted', '#8b949e');
      }
    };

    applyTheme(theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('titan-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

