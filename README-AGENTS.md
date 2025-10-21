# 🤖 Guide des Agents - Projet Soliva

## 🎯 Introduction

Ce projet utilise une **approche multi-agents** pour améliorer l'efficacité du développement avec l'IA. Chaque agent est spécialisé dans un domaine spécifique et dispose de sa propre documentation et conventions.

---

## 📋 Liste des Agents

### 🧱 **Agent BLOCKS**
**Domaine** : Blocs de contenu modulaires  
**Documentation** : `docs/agents/AGENT-BLOCKS.md`  
**Localisation** : `src/blocks/auto-declared/`

**Responsabilités** :
- ✅ Créer de nouveaux blocs
- ✅ Modifier des blocs existants
- ✅ Débugger les erreurs de rendu
- ✅ Optimiser les performances

**Status** : ✅ **Validé et opérationnel** (21/10/2025)

**Exemples de tâches** :
- "Crée un bloc FAQ avec accordéon"
- "Modifie le QuoteBlock pour ajouter une image de fond"
- "Débugge l'erreur sur le TestimonialBlock"

---

### 📝 **Agent CONTENT**
**Domaine** : Rédaction et SEO  
**Documentation** : `docs/agents/AGENT-CONTENT.md`  
**Localisation** : `data/content.json`, `src/types/content.ts`

**Responsabilités** :
- ✅ Créer des articles de blog complets (structure, ton, SEO)
- ✅ Modifier le contenu des pages
- ✅ Optimiser le SEO (meta, schemas, liens internes)
- ✅ Utiliser les blocs existants pour structurer
- ✅ Générer du contenu dans le ton Soliva

**Status** : ✅ **Opérationnel** (21/10/2025)

**Article de référence** : `http://localhost:3006/blog/les-faux-outils-ia-qui-sont-juste-des-scripts`

**Exemples de tâches** :
- "Crée un article 'Les erreurs SEO 2025' avec SEO complet"
- "Modifie la page studio : change le hero title"
- "Optimise le SEO de l'article existant sur l'IA"

---

### 🎨 **Agent UI**
**Domaine** : Interface admin et composants UI  
**Documentation** : `docs/ADMIN-THEME-SYSTEM.md`  
**Localisation** : `src/app/admin/`, `src/components/ui/`

**Responsabilités** :
- Modifier l'interface admin
- Créer des composants UI réutilisables
- Améliorer l'UX
- Gérer les thèmes

**Status** : 🔄 En cours de documentation

---

### 🔧 **Agent API**
**Domaine** : Backend et APIs  
**Localisation** : `src/app/api/`

**Responsabilités** :
- Créer/modifier des routes API
- Gérer l'authentification
- Intégrations externes
- Upload de fichiers

**Status** : 🔄 En cours de documentation

---

### 🏗️ **Agent ARCHITECTURE**
**Domaine** : Structure et configuration  
**Documentation** : `docs/AGENTS-GUIDE.md`  
**Localisation** : Racine, `scripts/`

**Responsabilités** :
- Modifier la configuration
- Migrations de données
- Scripts d'automatisation
- Refactoring global

**Status** : 🔄 En cours de documentation

---

## 🚀 Comment utiliser les agents

### Dans Cursor

#### Méthode 1 : Via .cursorrules (recommandé)
Le fichier `.cursorrules` contient les règles pour tous les agents. Cursor les charge automatiquement.

#### Méthode 2 : Mention explicite
```
@AGENT-BLOCKS Crée un bloc VideoBlock avec embed YouTube/Vimeo
```

#### Méthode 3 : Context implicite
Ouvre un fichier dans un domaine spécifique, l'agent approprié sera activé automatiquement.

---

## 📚 Documentation par agent

| Agent | Doc principale | Doc secondaire |
|-------|----------------|----------------|
| **BLOCKS** | `docs/agents/AGENT-BLOCKS.md` | `README-SCALABLE-BLOCKS.md` |
| **CONTENT** | `README-CONTENT-SYSTEM.md` | - |
| **UI** | `docs/ADMIN-THEME-SYSTEM.md` | - |
| **API** | À créer | - |
| **ARCHITECTURE** | `docs/AGENTS-GUIDE.md` | - |

---

## ✅ Workflow multi-agents

### Exemple : Créer une nouvelle fonctionnalité "Portfolio"

1. **Agent ARCHITECTURE** : Planifier la structure
   ```
   - Nouveau bloc PortfolioBlock
   - Route API pour récupérer les projets
   - Page dédiée /work/[slug]
   ```

2. **Agent BLOCKS** : Créer le bloc
   ```
   Crée PortfolioBlock avec grille de projets,
   filtres par catégorie et lightbox
   ```

3. **Agent API** : Créer l'API
   ```
   Crée /api/projects avec filtres et pagination
   ```

4. **Agent CONTENT** : Ajouter le contenu
   ```
   Ajoute 5 projets exemple dans content.json
   ```

5. **Agent UI** : Peaufiner l'interface
   ```
   Améliore l'éditeur du PortfolioBlock avec
   drag & drop pour réordonner les projets
   ```

---

## 🎯 Conventions générales

### Pour TOUS les agents

#### Code
- ✅ TypeScript strict (pas de `any`)
- ✅ Composants fonctionnels React
- ✅ Hooks standards
- ✅ Tailwind pour le CSS
- ✅ Convention de nommage : PascalCase (composants), camelCase (fonctions)

#### Documentation
- ✅ Commentaires en français
- ✅ JSDoc pour les fonctions publiques
- ✅ README à jour après chaque feature

#### Qualité
- ✅ `npm run build` sans erreur
- ✅ Pas de console.log en prod
- ✅ Responsive mobile-first
- ✅ Accessibilité (alt, aria-labels)

---

## 🔥 Cas d'usage réels

### Cas 1 : Bug urgent sur un bloc

**Contexte** : Le QuoteBlock ne s'affiche plus en production

**Solution** :
1. Activer **Agent BLOCKS**
2. "Débugge le QuoteBlock, il ne s'affiche plus"
3. L'agent lit le code, identifie le problème, propose un fix
4. Valider et tester

---

### Cas 2 : Nouvelle feature complexe

**Contexte** : Ajouter un système de newsletter

**Solution** :
1. **Agent ARCHITECTURE** : "Planifie l'ajout d'un système de newsletter"
2. **Agent BLOCKS** : "Crée un bloc NewsletterBlock"
3. **Agent API** : "Crée l'API /api/newsletter/subscribe"
4. **Agent UI** : "Ajoute une page admin pour gérer les abonnés"

---

### Cas 3 : Refactoring progressif

**Contexte** : Migrer tous les .jsx en .tsx

**Solution** :
1. **Agent ARCHITECTURE** : "Liste tous les fichiers .jsx à migrer"
2. Pour chaque domaine, activer l'agent approprié
3. Migration progressive par agent
4. Validation TypeScript au fur et à mesure

---

## 📊 Status du projet

### Phase 1 : Fondations ✅ TERMINÉE

| Tâche | Status | Date |
|-------|--------|------|
| Unification blocs | ✅ | 21/10/2025 |
| Documentation agents | ✅ | 21/10/2025 |
| Test bloc (Testimonial) | ✅ | 21/10/2025 |
| Fichier .cursorrules | ✅ | 21/10/2025 |

### Phase 2 : Qualité 🔄 EN COURS

| Tâche | Status | Agent |
|-------|--------|-------|
| TypeScript strict | 🔄 | ARCHITECTURE |
| Validation Zod | 🔄 | API |
| Nettoyage .backup | 🔄 | ARCHITECTURE |
| Migration .jsx → .tsx | 🔄 | Tous |

### Phase 3 : Optimisation 📋 À VENIR

| Tâche | Status | Agent |
|-------|--------|-------|
| Performance blocs | 📋 | BLOCKS |
| SEO avancé | 📋 | CONTENT |
| A11y audit | 📋 | UI |
| Tests E2E | 📋 | ARCHITECTURE |

---

## 🆘 Troubleshooting

### "L'agent ne comprend pas mon contexte"

**Solution** : Sois plus explicite
```
❌ "Crée un bloc"
✅ "@AGENT-BLOCKS Crée un bloc TestimonialBlock avec photo, nom, entreprise, témoignage et note sur 5"
```

### "Deux agents se marchent dessus"

**Solution** : Séquence les tâches
```
1. @AGENT-BLOCKS termine son bloc
2. Puis @AGENT-UI améliore l'éditeur
```

### "L'agent modifie des fichiers hors de sa zone"

**Solution** : Rappelle les règles
```
@AGENT-BLOCKS Tu ne dois modifier QUE les fichiers dans src/blocks/auto-declared/
```

---

## 🎓 Best Practices

### ✅ DO

- Lire la doc de l'agent avant de commencer
- Tester après chaque modification
- Documenter les nouveaux patterns
- Demander une review si pas sûr
- Utiliser le bon agent pour la bonne tâche

### ❌ DON'T

- Ne jamais modifier hors de ta zone
- Ne jamais commit sans tester
- Ne jamais utiliser `any` en TypeScript
- Ne jamais supprimer des fichiers sans backup
- Ne jamais hardcoder des valeurs

---

## 📞 Contacts & Ressources

- **Documentation principale** : `docs/AGENTS-GUIDE.md`
- **Issues** : Créer une issue GitHub avec le tag `[AGENT-XXX]`
- **Slack** : Canal `#agents-dev`

---

## 🎯 Prochaines étapes

1. ✅ **Phase 1 terminée** - Système validé
2. 🔄 **Phase 2 en cours** - TypeScript strict + Zod
3. 📋 **Phase 3** - Performance + SEO
4. 📋 **Phase 4** - Tests automatisés

---

**Version** : 1.0  
**Dernière mise à jour** : 21 octobre 2025  
**Maintenu par** : Agent ARCHITECTURE + Équipe dev

