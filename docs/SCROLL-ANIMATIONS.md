# 🎬 Système d'Animations de Scroll

Système complet pour gérer les animations de scroll avec GSAP, style Awwwards.

## 📋 Vue d'ensemble

Le système permet de :
- Configurer des animations globales pour tous les blocs
- Définir des animations spécifiques par type de bloc
- Utiliser des animations élégantes prédéfinies (fade in, slide, scale, etc.)
- Personnaliser la durée, le délai, l'easing et le point de déclenchement

## 🎯 Configuration dans l'Admin

1. Aller dans **Admin → Animations Scroll**
2. Activer les animations
3. Configurer l'animation globale (par défaut pour tous les blocs)
4. Optionnellement, configurer des animations spécifiques par type de bloc

## 🎨 Types d'animations disponibles

- **fade-in** : Apparition en fondu simple
- **fade-in-up** : Apparition depuis le bas avec fondu
- **fade-in-down** : Apparition depuis le haut avec fondu
- **fade-in-left** : Apparition depuis la gauche avec fondu
- **fade-in-right** : Apparition depuis la droite avec fondu
- **scale-in** : Apparition avec zoom depuis 0.8
- **scale-in-up** : Zoom depuis le bas
- **rotate-in** : Rotation légère à l'apparition
- **blur-in** : Apparition avec flou progressif
- **slide-up** : Glissement depuis le bas
- **slide-down** : Glissement depuis le haut
- **slide-left** : Glissement depuis la droite
- **slide-right** : Glissement depuis la gauche
- **split-text-up** : Texte divisé qui monte (pour titres)
- **split-text-down** : Texte divisé qui descend (pour titres)
- **parallax** : Effet de parallaxe au scroll

## 💻 Utilisation dans le code

### Option 1 : Utiliser le composant `ScrollAnimated`

```tsx
import ScrollAnimated from '@/components/ScrollAnimated';

// Dans votre composant de bloc
export default function MyBlock({ data }) {
  return (
    <ScrollAnimated blockType="ContentBlock" content={content}>
      <div>
        {/* Votre contenu */}
      </div>
    </ScrollAnimated>
  );
}
```

### Option 2 : Utiliser le hook `useScrollAnimation`

```tsx
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useRef } from 'react';

export default function MyBlock({ data, content }) {
  const ref = useRef<HTMLDivElement>(null);
  
  useScrollAnimation(ref, {
    blockType: 'ContentBlock',
    content: content,
    enabled: true
  });

  return (
    <div ref={ref}>
      {/* Votre contenu */}
    </div>
  );
}
```

### Option 3 : Animation personnalisée

```tsx
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

useScrollAnimation(ref, {
  config: {
    type: 'fade-in-up',
    duration: 1.2,
    delay: 0.2,
    easing: 'power4.out',
    threshold: 0.3
  },
  enabled: true
});
```

## 📦 Structure de données

Les animations sont stockées dans `content.metadata.scrollAnimations` :

```json
{
  "metadata": {
    "scrollAnimations": {
      "enabled": true,
      "global": {
        "type": "fade-in-up",
        "duration": 1,
        "delay": 0,
        "stagger": 0,
        "easing": "power3.out",
        "threshold": 0.2
      },
      "blocks": {
        "ContentBlock": {
          "type": "fade-in",
          "duration": 0.8
        },
        "H2Block": {
          "type": "split-text-up",
          "duration": 1.2,
          "stagger": 0.1
        }
      }
    }
  }
}
```

## 🔧 Paramètres

### `type` (ScrollAnimationType)
Type d'animation à utiliser

### `duration` (number, défaut: 1)
Durée de l'animation en secondes

### `delay` (number, défaut: 0)
Délai avant le début de l'animation en secondes

### `stagger` (number, défaut: 0)
Délai entre chaque élément (utile pour les listes)

### `easing` (string, défaut: 'power3.out')
Courbe d'animation GSAP :
- `power1.out`, `power2.out`, `power3.out`, `power4.out`
- `back.out(1.7)`
- `elastic.out(1, 0.3)`
- `expo.out`
- `sine.out`

### `threshold` (number, défaut: 0.2)
Point de déclenchement (0 = bas de l'écran, 1 = haut de l'écran)

## 🎯 Exemples d'intégration dans les blocs

### Exemple 1 : Bloc de contenu simple

```tsx
// src/blocks/auto-declared/ContentBlock/component.tsx
import ScrollAnimated from '@/components/ScrollAnimated';

export default function ContentBlock({ data, content }) {
  return (
    <ScrollAnimated blockType="ContentBlock" content={content}>
      <div className="content-block">
        <FormattedText>{data.content}</FormattedText>
      </div>
    </ScrollAnimated>
  );
}
```

### Exemple 2 : Titre avec SplitText

```tsx
// src/blocks/auto-declared/H2Block/component.tsx
import ScrollAnimated from '@/components/ScrollAnimated';

export default function H2Block({ data, content }) {
  return (
    <ScrollAnimated blockType="H2Block" content={content}>
      <h2>{data.title}</h2>
    </ScrollAnimated>
  );
}
```

### Exemple 3 : Liste avec stagger

```tsx
// src/blocks/auto-declared/ProjectsBlock/component.tsx
import ScrollAnimated from '@/components/ScrollAnimated';

export default function ProjectsBlock({ data, content }) {
  return (
    <div>
      {data.projects.map((project, index) => (
        <ScrollAnimated 
          key={project.id}
          blockType="ProjectsBlock"
          content={content}
          animationConfig={{
            type: 'fade-in-up',
            duration: 0.8,
            delay: index * 0.1, // Stagger manuel
            easing: 'power3.out'
          }}
        >
          <div className="project-item">
            {/* Contenu du projet */}
          </div>
        </ScrollAnimated>
      ))}
    </div>
  );
}
```

## 🚀 Bonnes pratiques

1. **Performance** : Les animations utilisent `once: true` par défaut pour ne se déclencher qu'une fois
2. **Accessibilité** : Respecter `prefers-reduced-motion` (à implémenter si nécessaire)
3. **Mobile** : Tester les animations sur mobile, certaines peuvent être désactivées
4. **Stagger** : Utiliser le stagger pour les listes d'éléments
5. **Threshold** : Ajuster le threshold selon le type de contenu (titres plus haut, contenu plus bas)

## 🔍 Debugging

Pour déboguer les animations :

1. Ouvrir la console du navigateur
2. Vérifier que ScrollTrigger est bien initialisé
3. Vérifier que la configuration est bien chargée depuis `content.metadata.scrollAnimations`
4. Utiliser `ScrollTrigger.refresh()` si nécessaire après un changement de contenu

## 📚 Ressources

- [GSAP ScrollTrigger Documentation](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [GSAP Easing Visualizer](https://greensock.com/ease-visualizer/)

