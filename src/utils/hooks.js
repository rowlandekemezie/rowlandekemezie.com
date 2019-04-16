import React, {
  useState, useEffect
} from 'react';

const ThemeContext = React.createContext({ isDark: false, toggleTheme: () => {} });

const useDarkThemeEffect = () => {
  const [themeState, setThemeState] = useState({
    isDark: false,
    hasThemeLoaded: false
  });

  useEffect(() => {
    const lsDark = localStorage.getItem('isDark') === 'true';
    setThemeState({ ...themeState, isDark: lsDark, hasThemeLoaded: true });
  }, []);

  return { themeState, setThemeState };
};

const ThemeProvider = ({
  children
}) => {
  const { themeState, setThemeState } = useDarkThemeEffect();

  if (!themeState.hasThemeLoaded) return <div />;

  const toggleTheme = () => {
    const isDark = !themeState.isDark;
    localStorage.setItem('isDark', JSON.stringify(isDark));
    setThemeState({ ...themeState, isDark });
  };

  return (
    <ThemeContext.Provider
      value={{
        isDark: themeState.isDark,
        toggleTheme
      }}>
        {children}
    </ThemeContext.Provider>
  );
};

export { ThemeProvider, ThemeContext, useDarkThemeEffect };