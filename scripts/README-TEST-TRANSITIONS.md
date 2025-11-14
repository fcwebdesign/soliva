# 🧪 Scripts de Test des Transitions

Scripts automatisés pour tester la fluidité des transitions de page et détecter les problèmes de performance.

## 🚀 Utilisation Rapide

### Méthode 1 : Console du Navigateur (Recommandé)

1. Ouvrir votre site en développement (`npm run dev`)
2. Ouvrir la console du navigateur (F12)
3. Copier-coller le contenu de `test-transitions-browser.js`
4. Lancer les tests :

```javascript
// Test rapide (un seul clic)
transitionTester.quickTest()

// Série complète de tests
transitionTester.runTests()

// Tests personnalisés
transitionTester.runTests({
  delays: [0, 50, 100, 150, 200],  // Délais entre les clics à tester
  iterations: 5,                    // Nombre d'itérations par délai
  linkIndex: 0                      // Index du lien à tester (0 = premier lien)
})
```

### Méthode 2 : Script TypeScript

```bash
# Compiler le script (si nécessaire)
npx tsc scripts/test-transitions.ts

# Utiliser dans votre code
import TransitionTester from './scripts/test-transitions';
```

## 📊 Ce que le script teste

- **Temps de réponse** : Mesure le délai entre le clic et le début de la transition
- **Différents délais** : Teste avec des délais variables entre les clics (0ms, 50ms, 100ms, etc.)
- **Détection de problèmes** : Identifie les transitions lentes (>200ms) ou très lentes (>500ms)
- **Analyse par délai** : Montre quels délais causent le plus de problèmes

## 📈 Résultats

Le script affiche :
- ✅ Nombre de tests réussis/échoués
- ⏱️ Temps de réponse moyen, min, max
- 📈 Analyse par délai entre clics
- ⚠️ Détection des problèmes de fluidité
- 💾 Résultats exportables en JSON

## 🎯 Interprétation des résultats

### ✅ Bonne performance
- Temps de réponse < 100ms : Excellent
- Temps de réponse 100-200ms : Bon
- Aucun test lent détecté

### ⚠️ Problèmes détectés
- Temps de réponse > 200ms : Problème de fluidité
- Temps de réponse > 500ms : Problème critique
- Tests échoués : Vérifier les erreurs dans la console

## 🔍 Exemple de sortie

```
🚀 Démarrage des tests de transitions
📊 Configuration: 3 itérations, délais: 0, 50, 100, 150, 200, 300, 500ms

📦 Itération 1/3
✅ Test 0: Transition démarrée après 45.23ms (délai entre clics: 0ms)
✅ Test 1: Transition démarrée après 52.10ms (délai entre clics: 50ms)
...

📊 ===== RÉSULTATS DES TESTS =====

✅ Tests réussis: 21/21
❌ Tests échoués: 0/21

⏱️ Temps de réponse (début de transition):
   Moyenne: 48.50ms
   Min: 35.20ms
   Max: 125.30ms

📈 Analyse par délai entre clics:
   Délai 0ms: moyenne 45.23ms, 0 tests lents (>200ms)
   Délai 50ms: moyenne 52.10ms, 0 tests lents (>200ms)
   ...

🔍 Analyse des problèmes:
✅ Aucun problème de fluidité détecté
```

## 🛠️ Personnalisation

### Tester un lien spécifique
```javascript
// Trouver l'index du lien
const links = document.querySelectorAll('nav a[href^="/"]');
console.log('Liens disponibles:', Array.from(links).map((l, i) => `${i}: ${l.getAttribute('href')}`));

// Tester le lien à l'index 2
transitionTester.runTests({ linkIndex: 2 });
```

### Tests intensifs
```javascript
// Beaucoup d'itérations pour détecter les problèmes intermittents
transitionTester.runTests({
  delays: [0, 50, 100, 150, 200],
  iterations: 10
});
```

### Tests de stress
```javascript
// Tester avec des clics très rapides
transitionTester.runTests({
  delays: [0, 10, 20, 30, 40, 50],
  iterations: 5
});
```

## 🐛 Dépannage

### Aucun lien trouvé
- Vérifier que vous êtes sur une page avec un menu de navigation
- Les liens doivent commencer par `/` et ne pas être dans `/admin`

### Tests qui échouent
- Vérifier que les transitions fonctionnent manuellement
- Vérifier la console pour les erreurs JavaScript
- Augmenter le timeout si nécessaire (modifier `3000` dans le script)

### Résultats incohérents
- Attendre que la page soit complètement chargée avant de lancer les tests
- Fermer les autres onglets pour éviter les conflits
- Désactiver les extensions du navigateur qui pourraient interférer

## 📝 Notes

- Les tests simulent des clics réels sur les liens
- Le script attend entre chaque test pour laisser le temps aux transitions de se terminer
- Les résultats sont exportables en JSON pour analyse approfondie
- Le script détecte automatiquement les liens du menu de navigation

