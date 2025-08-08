// Configuration des transitions de page
export const TRANSITION_CONFIG = {
  // Mode de transition : 'circle' (cercle transparent) ou 'curtain' (rideau noir)
  mode: 'circle', // Changez à 'curtain' pour revenir au rideau noir
  
  // Couleur du cercle de transition (seulement en mode 'circle')
  circleColor: 'var(--accent)', // Utilise la variable CSS --accent (bleu)
  
  // Couleur du rideau (seulement en mode 'curtain')
  curtainColor: 'var(--fg)', // Utilise la variable CSS --fg (noir)
};

// Fonction utilitaire pour vérifier le mode actuel
export const getTransitionMode = () => TRANSITION_CONFIG.mode;

// Fonction pour changer le mode dynamiquement
export const setTransitionMode = (newMode) => {
  if (newMode === 'circle' || newMode === 'curtain') {
    TRANSITION_CONFIG.mode = newMode;
    console.log(`Mode de transition changé vers: ${newMode}`);
  } else {
    console.error('Mode invalide. Utilisez "circle" ou "curtain"');
  }
}; 