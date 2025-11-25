# Problème : Animations de révélation au scroll désactivées dans l'iframe

## Contexte

Nous avons une interface d'administration avec une preview dans une **iframe** (`/admin/preview/iframe`). Cette iframe affiche le rendu des blocs avec `BlockRenderer` et utilise un système d'animations de révélation au scroll basé sur **GSAP ScrollTrigger**.

## Architecture des animations

### Système d'animations

1. **`BlockRenderer`** : Rend les blocs et les enveloppe avec `ScrollAnimated` si les animations sont activées
2. **`ScrollAnimated`** : Composant wrapper qui utilise le hook `useScrollAnimation`
3. **`useScrollAnimation`** : Hook qui crée les animations GSAP avec ScrollTrigger
4. **ScrollTrigger** : Plugin GSAP qui détecte quand les éléments entrent dans le viewport et déclenche les animations

### Types d'animations disponibles

- `fade-in`, `fade-in-up`, `fade-in-down`, `fade-in-left`, `fade-in-right`
- `scale-in`, `scale-in-up`
- `rotate-in`, `blur-in`
- `slide-up`, `slide-down`, `slide-left`, `slide-right`
- `split-text-up`, `split-text-down`
- `parallax`

### Configuration

Les animations sont configurées dans `metadata.scrollAnimations` :
- `enabled: true/false` : Active ou désactive les animations
- `global.type` : Type d'animation par défaut pour tous les blocs
- `blocks[blockType].type` : Type d'animation spécifique pour un type de bloc

## Problème actuel

### Symptômes

Les animations de révélation au scroll **ne fonctionnent plus** dans l'iframe de preview. Les blocs apparaissent directement sans animation.

### Cause

Pour résoudre un problème de saccades lors du scroll programmatique vers les blocs, nous avons :

1. **Désactivé complètement les animations** : `disableScrollAnimations={true}` est passé à `BlockRenderer` dans l'iframe
2. **Désactivé les refresh automatiques de ScrollTrigger** : `ScrollTrigger.config({ autoRefreshEvents: 'none' })`
3. **Désactivé le wrapper d'animations** : `wrapWithAnimation` retourne directement le bloc sans `ScrollAnimated` si `disableScrollAnimations` est `true`

### Code actuel dans l'iframe

```typescript
// src/app/admin/preview/iframe/page.tsx

// Désactiver ScrollTrigger dans l'iframe pour éviter les saccades
useEffect(() => {
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.config({ autoRefreshEvents: 'none' });
  }
  return () => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.config({ autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load' });
    }
  };
}, []);

// Un seul refresh ScrollTrigger après le rendu des blocs
useEffect(() => {
  if (visibleBlocks.length === 0 || !previewData) return;
  const timeoutId = setTimeout(() => {
    if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh) {
      ScrollTrigger.refresh();
    }
  }, 500);
  return () => clearTimeout(timeoutId);
}, [visibleBlocks.length, previewData]);

// BlockRenderer avec animations désactivées
<BlockRenderer
  blocks={visibleBlocks as any}
  content={previewData}
  withDebugIds
  highlightBlockId={highlightBlockId || undefined}
  disableScrollAnimations={true}  // ← PROBLÈME : animations complètement désactivées
/>
```

### Code dans BlockRenderer

```typescript
// src/blocks/BlockRenderer.tsx

// Helper pour wrapper un bloc avec ScrollAnimated si nécessaire
const wrapWithAnimation = (blockElement: React.ReactElement, blockType: string) => {
  // Désactiver les animations si demandé (iframe)
  if (disableScrollAnimations) {
    return blockElement;  // ← Retourne directement sans animation
  }
  
  const scrollAnimations = fullContent?.metadata?.scrollAnimations;
  if (!scrollAnimations?.enabled) {
    return blockElement;
  }

  const animationBlockType = getAnimationBlockType(blockType);
  return (
    <ScrollAnimated
      key={blockElement.key || blockType}
      blockType={animationBlockType}
      content={fullContent}
    >
      {blockElement}
    </ScrollAnimated>
  );
};
```

## Contraintes

### Problème initial résolu

Nous avons résolu le problème de **saccades lors du scroll programmatique** en :
- Désactivant les refresh automatiques de ScrollTrigger
- Utilisant un seul refresh manuel après le rendu
- Désactivant les animations pour éviter les recalculs pendant le scroll

### Nouveau problème

En désactivant complètement les animations, nous avons perdu la fonctionnalité de **révélation au scroll**, ce qui est une fonctionnalité importante pour l'expérience utilisateur.

## Solution recherchée

Une solution qui permet :

1. **Les animations de révélation fonctionnent** : Les blocs doivent s'animer quand ils entrent dans le viewport lors du scroll naturel
2. **Pas de saccades lors du scroll programmatique** : Le scroll vers un bloc spécifique (depuis le sommaire ou clic direct) doit rester fluide
3. **ScrollTrigger fonctionne correctement** : Les animations doivent être détectées et déclenchées au bon moment
4. **Pas de conflit entre scroll programmatique et animations** : Les animations ne doivent pas interférer avec le scroll programmatique

## Approches possibles

### Option 1 : Réactiver les animations avec gestion intelligente

- Réactiver `disableScrollAnimations={false}` dans l'iframe
- Garder `autoRefreshEvents: 'none'` pour éviter les refreshs automatiques
- Faire un refresh manuel après le rendu initial
- **Problème potentiel** : Les animations peuvent toujours causer des saccades si ScrollTrigger recalcule pendant le scroll programmatique

### Option 2 : Désactiver temporairement ScrollTrigger pendant le scroll programmatique

- Réactiver les animations normalement
- Désactiver ScrollTrigger juste avant un scroll programmatique
- Réactiver ScrollTrigger après la fin du scroll (environ 500-600ms)
- **Avantage** : Les animations fonctionnent, mais sont temporairement désactivées pendant le scroll programmatique

### Option 3 : Utiliser `ScrollTrigger.batch()` ou `ScrollTrigger.matchMedia()`

- Grouper les animations pour réduire les recalculs
- Utiliser des media queries pour adapter le comportement selon le contexte
- **Complexité** : Plus complexe à mettre en place

### Option 4 : Debounce/Throttle les refreshs de ScrollTrigger

- Réactiver les animations
- Limiter les refreshs de ScrollTrigger avec un debounce
- **Avantage** : Réduit les recalculs sans désactiver complètement

## Recommandation

L'**Option 2** semble la plus prometteuse :
- Permet aux animations de fonctionner normalement
- Désactive temporairement ScrollTrigger uniquement pendant le scroll programmatique
- Réactive après la fin du scroll pour que les animations continuent de fonctionner

## Fichiers concernés

- `src/app/admin/preview/iframe/page.tsx` : Configuration de ScrollTrigger et passage de `disableScrollAnimations`
- `src/blocks/BlockRenderer.tsx` : Logique de `wrapWithAnimation` et prop `disableScrollAnimations`
- `src/components/ScrollAnimated.tsx` : Wrapper des animations
- `src/hooks/useScrollAnimation.ts` : Hook qui crée les animations GSAP avec ScrollTrigger

## Note importante

Le scroll programmatique utilise `window.scrollTo({ top: target, behavior: 'smooth' })` avec un délai de correction de 200ms. Il faut s'assurer que ScrollTrigger ne recalcule pas pendant cette période pour éviter les saccades.

