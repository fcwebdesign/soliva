# Problème : Bugs de positionnement lors du scroll vers les blocs dans l'iframe

## Contexte

Nous avons une interface d'administration avec un éditeur visuel qui affiche une preview dans une **iframe** (`/admin/preview/iframe`). Cette iframe permet d'isoler le rendu de la preview pour éviter les conflits CSS/JS et permettre un rendu responsive correct.

## Architecture

- **Page parent** : `/admin/preview` - Contient l'éditeur à gauche et l'iframe à droite
- **Iframe** : `/admin/preview/iframe` - Affiche le rendu des blocs avec `BlockRenderer`
- **Communication** : `postMessage` entre parent et iframe

## Fonctionnalité attendue

Lorsqu'un utilisateur clique sur un bloc dans le sommaire (ou directement dans la preview), le système doit :
1. Scroller jusqu'au bloc sélectionné
2. Positionner le bloc correctement (centré pour le sommaire, en haut pour le clic direct)
3. Appliquer un highlight visuel temporaire
4. Prendre en compte le `scroll-margin-top: 96px` défini sur les blocs

## Problème actuel

Après des optimisations pour éliminer les saccades du scroll, le positionnement des blocs lors de la sélection est **incorrect** :

### Symptômes
- Le scroll ne positionne pas le bloc au bon endroit
- Le bloc peut être partiellement visible ou mal centré
- Le `scroll-margin-top` n'est pas correctement pris en compte
- Le positionnement varie selon le type de scroll (centré vs aligné en haut)

### Code actuel dans l'iframe (`src/app/admin/preview/iframe/page.tsx`)

```typescript
case 'SCROLL_TO_BLOCK':
  const blockId = payload.blockId;
  const alignToTop = payload.alignToTop || false;
  
  const performScroll = () => {
    const element = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;
    if (!element) return;
    
    const scrollMarginTop = parseInt(window.getComputedStyle(element).scrollMarginTop) || 96;
    
    if (alignToTop) {
      // Scroll pour aligner en haut avec offset
      const elementTop = element.offsetTop;
      window.scrollTo({ 
        top: Math.max(0, elementTop - scrollMarginTop), 
        behavior: 'smooth' 
      });
    } else {
      // Scroll centré
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center', 
        inline: 'nearest' 
      });
    }
    
    // Highlight visuel
    element.classList.add('ring', 'ring-blue-200');
    setTimeout(() => {
      element.classList.remove('ring', 'ring-blue-200');
    }, 900);
  };
  
  requestAnimationFrame(() => {
    setTimeout(performScroll, 100);
  });
  break;
```

### Problèmes identifiés

1. **`offsetTop` dans l'iframe** : `element.offsetTop` est relatif au document, mais dans une iframe, cela peut ne pas correspondre à la position réelle dans le viewport scrollable.

2. **`scrollIntoView` avec `block: 'center'`** : Cette méthode ne prend pas correctement en compte le `scroll-margin-top` CSS. Le bloc peut être centré sans respecter le margin, ce qui le positionne incorrectement.

3. **Pas de correction après scroll** : L'ancienne version avait une correction après le scroll initial pour ajuster le positionnement. Cette correction a été supprimée pour éviter les saccades, mais elle était nécessaire pour un positionnement précis.

4. **Timing** : Le délai de 100ms peut ne pas être suffisant si le DOM n'est pas encore complètement rendu, ou trop long si le DOM est déjà prêt.

## Contraintes

- **Pas de saccades** : Le scroll doit être fluide, sans double scroll ou corrections multiples
- **Respect du scroll-margin-top** : Les blocs ont un `scroll-margin-top: 96px` qui doit être pris en compte
- **Deux modes de scroll** :
  - `alignToTop: false` : Scroll centré (depuis le sommaire)
  - `alignToTop: true` : Scroll aligné en haut (clic direct dans la preview)
- **Iframe** : Le scroll se fait dans le contexte de l'iframe, pas dans le parent

## Solution recherchée

Une solution qui :
1. Positionne correctement les blocs lors du scroll (centré ou en haut selon le mode)
2. Prend en compte le `scroll-margin-top` correctement
3. Évite les saccades (pas de double scroll, pas de corrections multiples)
4. Fonctionne de manière fiable dans le contexte d'une iframe
5. Gère correctement le timing (attendre que le DOM soit prêt sans délai excessif)

## Fichiers concernés

- `src/app/admin/preview/iframe/page.tsx` : Gestion du scroll dans l'iframe
- `src/app/admin/preview/page.tsx` : Fonction `scrollToBlock` qui envoie les messages à l'iframe
- `src/blocks/BlockRenderer.tsx` : Rendu des blocs avec `data-block-id` et `scroll-margin-top`

## Note

L'ancienne version fonctionnait mais avait des saccades. La version actuelle est fluide mais mal positionnée. Il faut trouver un équilibre entre fluidité et précision du positionnement.

