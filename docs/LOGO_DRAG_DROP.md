# Système de Drag & Drop pour les Logos Clients

## Vue d'ensemble

Le système de drag & drop pour les logos clients permet de réorganiser facilement l'ordre des logos dans l'éditeur de blocs. Il utilise l'API native HTML5 Drag & Drop avec des améliorations visuelles et des animations fluides.

## Fonctionnalités

### ✅ Fonctionnalités implémentées

- **Drag & Drop natif** : Utilise l'API HTML5 Drag & Drop
- **Feedback visuel** : Indicateurs visuels pendant le drag & drop
- **Animations fluides** : Transitions CSS pour une expérience utilisateur optimale
- **Gestion d'état** : États de drag, drop et hover bien gérés
- **Sauvegarde automatique** : Les changements sont automatiquement sauvegardés
- **Responsive** : Fonctionne sur tous les écrans

### 🎨 Indicateurs visuels

- **Élément en cours de déplacement** : Opacité réduite, rotation légère, ombre portée
- **Zone de drop** : Bordure bleue, fond légèrement coloré
- **Handle de drag** : Icône ⋮⋮ avec hover effect
- **Indicateur de drop** : Texte "Déposer ici" qui apparaît

## Structure du code

### Variables d'état

```typescript
const [draggedLogoIndex, setDraggedLogoIndex] = useState<number | null>(null);
const [dragOverLogoIndex, setDragOverLogoIndex] = useState<number | null>(null);
```

### Fonctions principales

#### `handleLogoDragStart`
- Initialise le drag
- Configure les données de transfert
- Ajoute les classes CSS pour le style

#### `handleLogoDragOver`
- Gère le survol des zones de drop
- Met à jour l'état visuel

#### `handleLogoDrop`
- Effectue la réorganisation des logos
- Met à jour l'état et sauvegarde

#### `handleLogoDragEnd`
- Nettoie les états et classes CSS
- Réinitialise l'interface

## Classes CSS utilisées

### Éléments draggables
```css
.logo-drag-item {
  transition: all 0.2s ease;
  cursor: grab;
}

.logo-drag-item.dragging {
  opacity: 0.5;
  transform: rotate(5deg) scale(0.95);
  z-index: 1000;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}
```

### Zones de drop
```css
.logo-drop-zone {
  position: relative;
  transition: all 0.2s ease;
}

.logo-drop-zone.drag-over {
  border-color: var(--accent);
  background-color: rgba(0, 102, 204, 0.05);
  transform: scale(1.02);
  box-shadow: 0 0 0 2px var(--accent);
}
```

### Handle de drag
```css
.logo-drag-handle {
  cursor: grab;
  color: #6b7280;
  transition: color 0.2s ease;
}

.logo-drag-handle:hover {
  color: var(--accent);
}
```

## Utilisation dans l'éditeur

### Dans le BlockEditor

```tsx
<div 
  key={index} 
  data-logo-index={index}
  className={`logo-drop-zone p-3 border border-gray-200 rounded-lg transition-all duration-200 ${
    draggedLogoIndex === index ? 'dragging' : ''
  } ${
    dragOverLogoIndex === index && draggedLogoIndex !== index 
      ? 'drag-over' 
      : ''
  }`}
  onDragOver={(e) => handleLogoDragOver(e, index)}
  onDrop={(e) => handleLogoDrop(e, index, block.id)}
>
  <div 
    className="logo-drag-item flex items-center gap-2"
    draggable
    onDragStart={(e) => handleLogoDragStart(e, index)}
    onDragEnd={handleLogoDragEnd}
  >
    <span className="logo-drag-handle text-xs">⋮⋮</span>
    <span className="text-xs font-medium text-gray-600">Logo {index + 1}</span>
  </div>
  
  {/* Contenu du logo */}
</div>
```

## Améliorations possibles

### 🚀 Fonctionnalités futures

1. **Drag & Drop entre blocs** : Permettre de déplacer des logos entre différents blocs
2. **Undo/Redo** : Historique des actions de drag & drop
3. **Drag & Drop tactile** : Support amélioré pour les appareils tactiles
4. **Animations avancées** : Animations plus sophistiquées avec Framer Motion
5. **Validation** : Empêcher le drop dans certaines conditions

### 🎯 Optimisations techniques

1. **Performance** : Optimiser les re-renders avec React.memo
2. **Accessibilité** : Améliorer l'accessibilité avec ARIA labels
3. **Tests** : Ajouter des tests unitaires et d'intégration
4. **Types** : Améliorer les types TypeScript

## Dépannage

### Problèmes courants

1. **Le drag ne fonctionne pas**
   - Vérifier que l'élément a l'attribut `draggable`
   - S'assurer que les événements sont bien attachés

2. **Les styles ne s'appliquent pas**
   - Vérifier que les classes CSS sont bien définies
   - S'assurer que les états sont correctement mis à jour

3. **La sauvegarde ne fonctionne pas**
   - Vérifier que `updateBlocksContent` est appelée
   - S'assurer que l'état local est synchronisé

## Exemple de test

Un composant de démonstration est disponible dans `src/app/admin/components/LogoDragDropDemo.tsx` pour tester le système de drag & drop.

## Support navigateur

- ✅ Chrome/Chromium (recommandé)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Internet Explorer (support limité)

Le système utilise l'API HTML5 Drag & Drop native, garantissant une compatibilité maximale avec les navigateurs modernes. 