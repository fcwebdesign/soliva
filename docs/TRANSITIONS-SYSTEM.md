# Système de Transitions - Documentation

## 🎯 Objectif

Ce document explique comment fonctionne le système de transitions de pages et comment éviter les bugs récurrents liés à la localisation de la configuration.

## ⚠️ PROBLÈME RÉCURRENT RÉSOLU

**Bug historique** : La configuration des transitions était sauvegardée dans `metadata._transitionConfig` mais le code cherchait seulement `_transitionConfig` à la racine, causant des incohérences.

**Solution** : Fonction utilitaire centralisée dans `src/utils/transitionConfig.ts` qui garantit la cohérence.

## 📁 Structure de la Configuration

La configuration des transitions peut être stockée à **deux endroits** dans le fichier JSON :

1. **À la racine** : `content._transitionConfig` (priorité)
2. **Dans metadata** : `content.metadata._transitionConfig` (fallback)

### Format de la configuration

```typescript
{
  type: "slide-up" | "slide-down" | "fade" | ...,
  duration: 1500, // en millisecondes
  easing: "cubic-bezier(0.87, 0, 0.13, 1)",
  updatedAt: "2025-11-10T14:46:51.984Z",
  customStyles?: string // optionnel
}
```

## 🔧 Utilisation

### ✅ BONNE PRATIQUE : Utiliser la fonction utilitaire

```typescript
import { getTransitionConfig, setTransitionConfig } from '@/utils/transitionConfig';

// Lire la config
const config = getTransitionConfig(content);

// Écrire la config (sauvegarde automatiquement aux deux endroits)
setTransitionConfig(content, {
  type: 'slide-up',
  duration: 1500,
  easing: 'cubic-bezier(0.87, 0, 0.13, 1)'
});
```

### ❌ MAUVAISE PRATIQUE : Accès direct

```typescript
// ❌ NE PAS FAIRE ÇA
const config = content._transitionConfig || content.metadata?._transitionConfig;

// ❌ NE PAS FAIRE ÇA
content._transitionConfig = config;
content.metadata._transitionConfig = config;
```

## 📍 Fichiers Concernés

### 1. Fonction utilitaire centralisée
- **`src/utils/transitionConfig.ts`** : Fonctions `getTransitionConfig()` et `setTransitionConfig()`

### 2. Composant frontend
- **`src/templates/ThemeTransitions.tsx`** : Applique les styles CSS des transitions
  - ✅ Utilise `getTransitionConfig()` pour lire la config

### 3. API Routes
- **`src/app/api/transitions/route.ts`** : Endpoint pour sauvegarder/lire la config
  - ✅ Utilise `getTransitionConfig()` pour lire
  - ✅ Utilise `setTransitionConfig()` pour écrire

- **`src/app/api/content/route.ts`** : Endpoint public qui retourne le contenu
  - Le contenu retourné contient la config (lue depuis le bon fichier template)

### 4. Section Admin
- **`src/app/admin/components/sections/TransitionSection.tsx`** : Interface de configuration
  - Appelle `/api/transitions` pour sauvegarder

## 🔄 Flux de Données

```
1. Admin change la transition
   ↓
2. TransitionSection.tsx → POST /api/transitions
   ↓
3. /api/transitions → setTransitionConfig() → sauvegarde dans data/templates/{template}/content.json
   ↓
4. ThemeTransitions.tsx → GET /api/content → getTransitionConfig() → applique les styles
```

## 🎨 Templates et Fichiers

Pour les templates autonomes (comme `pearl`), la configuration est sauvegardée dans :
- `data/templates/{template}/content.json`

Pour le template par défaut (`soliva`), la configuration est dans :
- `data/content.json`

L'API `/api/content` détecte automatiquement le template actif et lit depuis le bon fichier.

## 🐛 Dépannage

### La transition ne change pas après sauvegarde

1. **Vérifier que la config est bien sauvegardée** :
   ```bash
   cat data/templates/pearl/content.json | grep -A 5 "_transitionConfig"
   ```

2. **Vérifier les logs dans la console** :
   - `🎨 [ThemeTransitions] Configuration transitions chargée:`
   - `🔄 [ThemeTransitions] Nouvelle config détectée, mise à jour...`

3. **Vérifier que le frontend charge depuis le bon fichier** :
   - Les logs de `/api/content` doivent montrer : `📁 [API Content] Lecture depuis le template "pearl"`

### La config est dans metadata mais pas à la racine

**Solution** : Utiliser `setTransitionConfig()` qui sauvegarde automatiquement aux deux endroits.

## ✅ Checklist avant de modifier le code

- [ ] Utiliser `getTransitionConfig()` pour lire la config
- [ ] Utiliser `setTransitionConfig()` pour écrire la config
- [ ] Ne jamais accéder directement à `content._transitionConfig` ou `content.metadata._transitionConfig`
- [ ] Tester que la transition change bien après sauvegarde
- [ ] Vérifier les logs dans la console pour confirmer le chargement

## 📝 Notes Importantes

1. **Sur l'admin** (`key: soliva`), `ThemeTransitions` ne charge pas la config (c'est normal, les transitions s'appliquent sur le frontend)

2. **Polling** : `ThemeTransitions` recharge la config toutes les 2 secondes pour détecter les changements

3. **Cache** : L'API `/api/content` utilise `cache: 'no-store'` et un timestamp dans l'URL pour éviter le cache navigateur

4. **Cohérence** : La fonction `setTransitionConfig()` sauvegarde **toujours** aux deux endroits pour garantir la cohérence, même si un seul endroit est utilisé pour la lecture

---

**Dernière mise à jour** : 10 novembre 2025  
**Auteur** : Système de transitions centralisé pour éviter les bugs récurrents

