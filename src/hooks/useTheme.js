import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialiser le thème au chargement
    const savedTheme = localStorage.getItem('theme') || 'light';
    setCurrentTheme(savedTheme);
    
    // Appliquer le thème au document
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Écouter les changements de thème dans d'autres onglets
    const handleStorageChange = (e) => {
      if (e.key === 'theme') {
        const newTheme = e.newValue || 'light';
        setCurrentTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    };

    // Écouter les changements de thème dans le même onglet
    const handleThemeChange = () => {
      const theme = localStorage.getItem('theme') || 'light';
      setCurrentTheme(theme);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Déclencher un événement personnalisé pour synchroniser tous les composants
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
  };

  const changeTheme = (theme) => {
    if (theme === 'light' || theme === 'dark') {
      setCurrentTheme(theme);
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      
      // Déclencher un événement personnalisé pour synchroniser tous les composants
      window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme } }));
    }
  };

  return {
    theme: currentTheme,
    toggleTheme,
    changeTheme,
    isDark: currentTheme === 'dark',
    isLight: currentTheme === 'light',
    mounted,
  };
}; 