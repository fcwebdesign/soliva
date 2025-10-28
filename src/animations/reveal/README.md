# Animation de Reveal

Cette animation de reveal est inspirée de l'exemple CodeGrid et adaptée pour le système de templates Soliva.

## Fonctionnalités

- **Animation au premier chargement uniquement** : Utilise `sessionStorage` pour éviter de relancer l'animation lors des retours sur la page
- **Configuration flexible** : Texte, images, couleurs et durée personnalisables
- **Intégration GSAP** : Utilise GSAP avec SplitText et CustomEase pour des animations fluides
- **Responsive** : S'adapte aux différentes tailles d'écran
- **Performance** : Optimisé avec `will-change` et cleanup automatique

## Utilisation

### Dans un template

```tsx
import { useRevealAnimation, RevealAnimation } from '@/animations/reveal';
import '@/animations/reveal/reveal.css';

export default function MyTemplate() {
  const { shouldShowReveal, isRevealComplete, completeReveal, config } = useRevealAnimation({
    text: {
      title: "Mon Template",
      subtitle: "Description du template",
      author: "Soliva"
    },
    images: ['/img1.jpg', '/img2.jpg', '/img3.jpg', '/img4.jpg'],
    duration: 4000,
    colors: {
      background: '#000000',
      text: '#ffffff',
      progress: '#ffffff'
    }
  });

  return (
    <div>
      {shouldShowReveal && (
        <RevealAnimation 
          config={config} 
          onComplete={completeReveal}
        />
      )}
      
      {isRevealComplete && (
        <div>Contenu principal du template</div>
      )}
    </div>
  );
}
```

### Configuration

```tsx
interface RevealConfig {
  duration?: number;           // Durée de l'animation en ms (défaut: 4000)
  images?: string[];           // Images à afficher (défaut: img1-4.jpg)
  text?: {
    title: string;             // Titre principal
    subtitle: string;          // Sous-titre
    author: string;            // Auteur/crédit
  };
  colors?: {
    background: string;        // Couleur de fond (défaut: #000000)
    text: string;             // Couleur du texte (défaut: #ffffff)
    progress: string;         // Couleur de la barre de progression (défaut: #ffffff)
  };
  easing?: string;            // Type d'easing GSAP (défaut: "hop")
}
```

## Structure des fichiers

```
src/animations/reveal/
├── hooks/
│   └── useRevealAnimation.ts    # Hook principal
├── RevealAnimation.tsx          # Composant d'animation
├── reveal.css                   # Styles CSS
└── index.ts                     # Exports
```

## Personnalisation

### Images
Placez vos images dans le dossier `public/` et référencez-les dans la configuration.

### Couleurs
Modifiez les couleurs via la configuration ou directement dans `reveal.css`.

### Durée
Ajustez la durée totale de l'animation via le paramètre `duration`.

### Reset de l'animation
Pour tester l'animation à nouveau, utilisez la console du navigateur :
```javascript
sessionStorage.removeItem('pearl-reveal-seen');
location.reload();
```

## Intégration avec les templates

L'animation est actuellement intégrée dans le template Pearl. Pour l'ajouter à d'autres templates :

1. Importez les composants nécessaires
2. Utilisez le hook `useRevealAnimation` avec une configuration adaptée
3. Conditionnez le rendu du contenu principal avec `isRevealComplete`

## Performance

- Utilise `will-change` pour optimiser les animations CSS
- Cleanup automatique des timelines GSAP
- Images optimisées avec `object-fit: cover`
- Responsive design avec media queries
