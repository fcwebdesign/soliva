# 🤖 Guide Multi-Agents - Projet Soliva

## 🎯 Vision du Projet

CMS Next.js modulaire avec système de blocs auto-déclarés, permettant la création et modification de contenu via une interface d'administration complète.

---

## 📁 Architecture Simplifiée

```
/src/
├── blocks/auto-declared/     → AGENT BLOCKS (composants de contenu)
├── app/admin/               → AGENT ADMIN (interface d'édition)
├── app/api/                 → AGENT API (endpoints backend)
├── lib/                     → AGENT DATA (logique métier)
├── components/              → AGENT UI (composants réutilisables)
└── templates/               → Templates de design
```

---

## 🤖 Agents & Responsabilités

### 🧩 Agent Blocks

**Mission :** Créer et maintenir les blocs de contenu du CMS.

**Fichiers :**
- `/src/blocks/auto-declared/` - Tous les blocs
- `/src/blocks/types.ts` - Types TypeScript

**Commandes :**
```bash
npm run generate-blocks  # Régénérer les imports
npm run dev              # Tester visuellement
```

**Processus de création d'un bloc :**
1. Créer dossier `/src/blocks/auto-declared/MonBloc/`
2. Créer `component.tsx` (rendu frontend)
3. Créer `editor.tsx` (interface admin)
4. Créer `index.ts` (enregistrement)
5. Lancer `npm run generate-blocks`

**Guide détaillé :** [AGENT-BLOCKS.md](./agents/AGENT-BLOCKS.md)

---

### 👨‍💼 Agent Admin

**Mission :** Maintenir et améliorer l'interface d'administration.

**Fichiers :**
- `/src/app/admin/` - Interface admin
- `/src/app/admin/components/` - Composants admin

**URLs de test :**
- `http://localhost:3000/admin` - Interface principale
- `http://localhost:3000/admin?page=home` - Éditer une page

**Guide détaillé :** [AGENT-ADMIN.md](./agents/AGENT-ADMIN.md)

---

### 🎨 Agent UI/UX

**Mission :** Gardien de l'harmonie visuelle - assurer la cohérence et la scalabilité de l'interface admin.

**Responsabilités :**
- Documenter les patterns UI existants
- Standardiser progressivement les incohérences
- Guidelines pour les nouveaux développements
- Checklist de validation UI

**Stack validée :**
- shadcn/ui (Button, Sheet, Dialog, AlertDialog, Input)
- Tailwind CSS (utility-first)
- lucide-react (icônes)
- sonner (notifications toast)

**Principe :** Capitaliser sur l'existant, pas de refonte globale. Améliorer progressivement.

**Guide détaillé :** [AGENT-UI.md](./agents/AGENT-UI.md)

---

### 🚀 **Agent PERFORMANCE** - Optimisation Core Web Vitals

**Quand l'utiliser** : Pour optimiser les performances, améliorer les Core Web Vitals, et l'expérience utilisateur

**Compétences** :
- Optimiser les images (Next.js Image, lazy loading, formats modernes)
- Réduire le JavaScript bundle (code splitting, lazy loading)
- Améliorer les Core Web Vitals (LCP, FID, CLS)
- Optimiser les fonts et CSS
- Implémenter le caching et la compression

**Stack validée** :
- Next.js Image (optimisation images)
- next/dynamic (code splitting)
- next/font (fonts optimisées)
- @next/bundle-analyzer (analyse bundle)

**Localisation** : `src/components/optimized/`, `src/utils/performance/`

**Documentation** : `docs/agents/AGENT-PERFORMANCE.md`

**Principe** : Mesurer avant/après, priorité mobile, progressive enhancement.

**Guide détaillé :** [AGENT-PERFORMANCE.md](./agents/AGENT-PERFORMANCE.md)

---

### 🔌 Agent API

**Mission :** Gérer les endpoints et la logique backend.

**Fichiers :**
- `/src/app/api/admin/` - Routes admin
- `/src/app/api/ai/` - Intégration IA
- `/src/lib/auth.ts` - Authentification

**Test endpoints :**
```bash
# Contenu
curl http://localhost:3000/api/admin/content

# Upload
curl -X POST http://localhost:3000/api/admin/upload \
  -F "file=@image.jpg"
```

**Guide détaillé :** [AGENT-API.md](./agents/AGENT-API.md)

---

### 📊 Agent Data

**Mission :** Gérer la structure de données et la persistance.

**Fichiers :**
- `/data/content.json` - Base de données JSON
- `/src/lib/content.ts` - Lecture/écriture
- `/src/types/content.ts` - Types de données

**Validation :**
```bash
# Vérifier la structure JSON
node -e "JSON.parse(require('fs').readFileSync('./data/content.json'))"
```

**Guide détaillé :** [AGENT-DATA.md](./agents/AGENT-DATA.md)

---

## ✅ Checklist Avant Commit

Chaque agent doit vérifier :

- [ ] TypeScript compile sans erreur (`npm run build`)
- [ ] Pas de `console.log` (utiliser `logger` de `/src/lib/logger.ts`)
- [ ] Types à jour dans `types.ts` concerné
- [ ] Documentation inline présente (commentaires JSDoc)
- [ ] Testé visuellement en local

---

## 🔧 Conventions de Code

### Nommage
- Fichiers : `PascalCase.tsx` pour composants, `camelCase.ts` pour utilitaires
- Composants : `PascalCase`
- Fonctions : `camelCase`
- Types : `PascalCase`
- Constantes : `UPPER_SNAKE_CASE`

### Structure d'un bloc
```
MonBloc/
├── component.tsx    # Composant React (frontend)
├── editor.tsx       # Éditeur admin
├── index.ts         # Enregistrement
├── types.ts         # Types spécifiques (optionnel)
└── styles.css       # Styles (optionnel)
```

### Imports
```typescript
// ✅ Bon
import { Button } from '@/components/ui/button';
import type { Content } from '@/types/content';

// ❌ Mauvais
import Button from '../../../components/ui/button';
```

---

## 🆘 En Cas de Problème

### Build échoue
```bash
# 1. Nettoyer le cache
rm -rf .next

# 2. Relancer
npm run build
```

### Bloc ne s'affiche pas
```bash
# Vérifier l'enregistrement
npm run generate-blocks

# Vérifier les imports dans /src/blocks/auto-declared/index.ts
```

### API ne répond pas
```bash
# Vérifier que le serveur tourne
npm run dev

# Vérifier les logs serveur
```

---

## 📚 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [README-CONTENT-SYSTEM.md](../README-CONTENT-SYSTEM.md) - Système de contenu
- [README-ADMIN-SYSTEM.md](../README-ADMIN-SYSTEM.md) - Système admin
- [README-SCALABLE-BLOCKS.md](../README-SCALABLE-BLOCKS.md) - Système de blocs

---

## 🚀 Workflow Type

### Créer un nouveau bloc
```bash
# 1. Agent Blocks créé le composant
cd src/blocks/auto-declared
mkdir MonBloc && cd MonBloc

# 2. Créer les fichiers (component, editor, index)

# 3. Régénérer les imports
npm run generate-blocks

# 4. Agent Admin teste l'édition
# Ouvrir /admin et créer un bloc

# 5. Agent Data valide la structure
# Vérifier data/content.json
```

### Modifier l'admin
```bash
# 1. Agent Admin modifie les composants
# Fichiers dans /src/app/admin/components/

# 2. Tester localement
npm run dev

# 3. Vérifier le build
npm run build
```

---

**Dernière mise à jour :** 21 octobre 2025
**Maintenu par :** Équipe Soliva

