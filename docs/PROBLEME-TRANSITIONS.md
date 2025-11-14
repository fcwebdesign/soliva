# 🐛 Problème des Transitions de Page - Analyse

## ❌ Problème actuel

### Symptômes
1. **Erreur récurrente** : `Error: Skipped ViewTransition due to another transition starting`
2. **Délai perceptible** entre le clic sur un lien du menu et le début de l'animation
3. **Transitions qui ne se déclenchent pas** parfois

### Impact UX
- **Très décevant** : L'animation est l'élément le plus important du site
- **Aucun site moderne n'a de délai** entre le clic et l'animation
- **Perte de confiance** : L'utilisateur pense que le site ne répond pas

---

## 🔍 Cause racine

### Problème 1 : Conflit entre systèmes de transition

**Système 1** : `next-view-transitions` (Link component)
- Déclenche automatiquement `startViewTransition()` au clic
- Gère les transitions nativement via l'API View Transitions du navigateur

**Système 2** : Notre code personnalisé (`usePageTransitions`, `TransitionGuard`)
- Intercepte les clics avec `preventDefault()`
- Ajoute des délais (600-1000ms pour Safari/Firefox)
- Tente de gérer les transitions manuellement

**Conflit** :
- Les deux systèmes essaient de gérer les transitions en même temps
- `TransitionGuard` intercepte le clic mais ne déclenche pas la transition immédiatement
- Le `Link` de `next-view-transitions` essaie de déclencher sa transition
- Résultat : Deux transitions tentent de démarrer → erreur "Skipped ViewTransition"

### Problème 2 : Délais artificiels

**Dans `usePageTransitions.ts` ligne 34** :
```typescript
const delay = isSafari() ? 1000 : 600;
setTimeout(() => {
  router.push(path);
}, delay);
```

**Impact** : 600-1000ms de délai avant que la transition ne commence = **délai perceptible et décevant**

### Problème 3 : Verrouillage trop agressif

**Dans `TransitionGuard.tsx`** :
- Intercepte TOUS les clics avec `capture: true`
- Utilise `preventDefault()` ce qui empêche le `Link` de fonctionner normalement
- Ajoute des timeouts de 2000ms pour déverrouiller

**Impact** : Le `Link` de `next-view-transitions` ne peut pas déclencher sa transition native

---

## ✅ Solution proposée

### Principe
1. **Laisser `next-view-transitions` gérer les transitions** (c'est son rôle)
2. **Intercepter `startViewTransition()` au niveau global** pour empêcher les doubles transitions
3. **Supprimer tous les délais** - la transition doit démarrer immédiatement
4. **Ne pas utiliser `preventDefault()`** sur les clics - laisser le Link fonctionner

### Approche technique

**Intercepter `document.startViewTransition`** :
```typescript
// Sauvegarder la fonction native
const originalStartViewTransition = document.startViewTransition;

// Remplacer par notre version qui vérifie le verrouillage
document.startViewTransition = function(callback) {
  if (isTransitionInProgress()) {
    console.log('🚫 Transition ignorée - une transition est déjà en cours');
    return; // Ne pas déclencher la transition
  }
  
  startTransition(); // Verrouiller
  return originalStartViewTransition.call(this, callback);
};
```

**Avantages** :
- ✅ Pas de délai - la transition démarre immédiatement
- ✅ Empêche les doubles transitions au niveau de l'API native
- ✅ Ne casse pas le fonctionnement normal des `Link`
- ✅ Compatible avec tous les navigateurs qui supportent View Transitions

---

## 🎯 Résultat attendu

1. **Clic sur un lien** → Transition démarre **immédiatement** (0ms de délai)
2. **Clics multiples rapides** → Seule la première transition se déclenche
3. **Plus d'erreur "Skipped ViewTransition"**
4. **UX fluide et professionnelle** comme les meilleurs sites modernes

---

## 📝 Fichiers à modifier

1. **`src/utils/transitionLock.ts`** : Ajouter l'interception de `startViewTransition`
2. **`src/components/TransitionGuard.tsx`** : Simplifier - ne plus intercepter les clics
3. **`src/hooks/usePageTransitions.ts`** : Supprimer les délais pour Safari/Firefox
4. **Tester** : Vérifier que les transitions démarrent immédiatement

---

## 🚨 Important

**Ne jamais ajouter de délai** entre le clic et le début de l'animation. C'est l'élément le plus important pour l'UX du site.

