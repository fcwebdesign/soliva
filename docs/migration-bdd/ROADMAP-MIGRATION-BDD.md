# 🗺️ Roadmap Migration BDD - Guide Pas à Pas

**Objectif** : Migrer de JSON vers PostgreSQL sans casser l'existant  
**Durée estimée** : 3-4 semaines (en fonction de ton rythme)  
**Prérequis** : Aucune connaissance BDD requise, on apprendra en chemin ! 🚀

---

## 📋 Vue d'ensemble

### Les 5 Phases Principales

1. **Phase 0** : Nettoyer l'existant (1-2 jours) ⚡ Quick Win
2. **Phase 1** : Setup BDD + Prisma (2-3 jours) 🛠️ Infrastructure
3. **Phase 2** : Migration des données (2-3 jours) 📦 Import
4. **Phase 3** : Dual-write (3-4 jours) ✍️ Écriture double
5. **Phase 4** : Dual-read puis DB only (3-4 jours) 📖 Lecture puis finalisation

**Total** : ~15-20 jours de travail (mais on peut étaler sur plusieurs semaines)

---

## 🎯 Phase 0 : Nettoyer l'existant (IMMÉDIAT)

**Objectif** : Stopper les chargements lourds AVANT même de toucher à la BDD

**Durée** : 1-2 jours

### Checklist

- [ ] **Supprimer tous les fallbacks `/api/content`**
  - Chercher dans le code : `fetch('/api/content')`
  - Remplacer par `/api/content/metadata` ou erreur contrôlée
  - Fichiers à modifier :
    - `src/templates/Starter-Kit/Starter-Kit-client.tsx`
    - `src/templates/pearl/pearl-client.tsx`
    - `src/blocks/auto-declared/ProjectsBlock/editor.tsx`
    - `src/app/admin/work/[id]/page.tsx`
    - `src/app/admin/template-manager/page.tsx`

- [ ] **Vérifier que les listes ne chargent pas `blocks`**
  - S'assurer que `/api/content/metadata` ne retourne pas les blocs complets
  - Vérifier que les composants de liste n'essaient pas d'accéder aux blocs

- [ ] **Tester que tout fonctionne encore**
  - Lancer `npm run dev`
  - Vérifier que les pages se chargent
  - Vérifier que l'admin fonctionne

**Résultat attendu** : Plus aucun chargement de plusieurs Mo, le site est déjà plus rapide ! ✅

---

## 🛠️ Phase 1 : Setup BDD + Prisma (Infrastructure)

**Objectif** : Installer PostgreSQL et Prisma, créer le schéma

**Durée** : 2-3 jours

### Étape 1.1 : Installer PostgreSQL

**Option A : Local (pour commencer)**
```bash
# macOS avec Homebrew
brew install postgresql@15
brew services start postgresql@15

# Créer une base de données
createdb soliva_cms
```

**Option B : Cloud (recommandé pour production)**
- **Neon** (gratuit, serverless) : https://neon.tech
- **Supabase** (gratuit, avec auth) : https://supabase.com
- **Railway** (simple) : https://railway.app

👉 **Recommandation** : Commencer avec Neon (gratuit, facile, serverless)

### Étape 1.2 : Installer Prisma

```bash
# Installer Prisma
npm install -D prisma
npm install @prisma/client

# Initialiser Prisma
npx prisma init
```

Cela crée :
- `prisma/schema.prisma` (le schéma de ta BDD)
- `.env` avec `DATABASE_URL`

### Étape 1.3 : Configurer le schéma

1. **Copier le schéma** depuis `docs/soliva-migration-bdd.md` (section 3)
2. **Coller dans** `prisma/schema.prisma`
3. **Configurer `DATABASE_URL`** dans `.env` :
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/soliva_cms"
   ```
   (ou l'URL fournie par Neon/Supabase)

### Étape 1.4 : Créer les tables

```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables dans la BDD
npx prisma db push
```

**Vérification** :
```bash
# Ouvrir Prisma Studio (interface visuelle)
npx prisma studio
```

Tu devrais voir tes tables vides ! 🎉

**Checklist Phase 1** :
- [ ] PostgreSQL installé et fonctionnel
- [ ] Prisma installé
- [ ] Schéma copié dans `prisma/schema.prisma`
- [ ] `DATABASE_URL` configuré
- [ ] Tables créées (`npx prisma db push`)
- [ ] Prisma Studio fonctionne

---

## 📦 Phase 2 : Migration des données (Import)

**Objectif** : Importer tout le contenu JSON dans la BDD

**Durée** : 2-3 jours

### Étape 2.1 : Créer le script de migration

1. **Créer le dossier** : `scripts/migrate-json-to-db.ts`
2. **Copier le script** depuis `docs/soliva-migration-bdd.md` (section 10)
3. **Adapter** la fonction `extractAll()` à ta structure JSON exacte

### Étape 2.2 : Tester en dry-run

```bash
# Tester sans écrire (dry-run)
npx tsx scripts/migrate-json-to-db.ts --dry-run
```

**Vérifier** :
- Les logs affichent le bon nombre de pages/articles/projects
- Pas d'erreurs de parsing

### Étape 2.3 : Migration réelle

```bash
# Migration réelle
npx tsx scripts/migrate-json-to-db.ts
```

**Vérification** :
- Ouvrir Prisma Studio : `npx prisma studio`
- Vérifier que les données sont là :
  - Sites créés
  - Pages importées
  - Articles importés
  - Projects importés (avec `visibility` correct)

### Étape 2.4 : Vérifier la migration

```bash
# Vérifier les MigrationRun
npx prisma studio
# Aller dans la table MigrationRun
# Vérifier que status = "success"
```

**Checklist Phase 2** :
- [ ] Script de migration créé
- [ ] Dry-run fonctionne
- [ ] Migration réelle exécutée
- [ ] Données visibles dans Prisma Studio
- [ ] `adminProjects` → `visibility="admin"`
- [ ] `projects` → `visibility="public"`
- [ ] MigrationRun enregistré avec status="success"

---

## ✍️ Phase 3 : Dual-write (Écriture double)

**Objectif** : Écrire dans BDD ET JSON simultanément

**Durée** : 3-4 jours

### Étape 3.1 : Créer les stores (JsonStore + DbStore)

1. **Créer** `src/content/store/types.ts` (interface)
2. **Créer** `src/content/store/JsonStore.ts` (implémentation JSON)
3. **Créer** `src/content/store/DbStore.ts` (implémentation BDD)

👉 **Astuce** : Commencer par `JsonStore` (c'est ce que tu as déjà), puis `DbStore` (nouveau)

### Étape 3.2 : Créer le ContentRepository

1. **Créer** `src/content/repository.ts`
2. **Copier** le code depuis `docs/soliva-migration-bdd.md` (section 4.2)
3. **Configurer** `CONTENT_MODE=dual_write` dans `.env`

### Étape 3.3 : Modifier les APIs admin

**Fichiers à modifier** :
- `src/app/api/admin/content/route.ts` (PUT)
- `src/app/api/admin/work/[id]/route.ts` (si existe)
- `src/app/api/admin/blog/[id]/route.ts` (si existe)

**Changement** :
```ts
// Avant
await writeToJsonFile(data);

// Après
import { getContentRepository } from '@/content/repository';
const repo = getContentRepository();
await repo.upsertArticle(siteKey, data);
```

### Étape 3.4 : Tester dual-write

1. **Modifier un article** dans l'admin
2. **Vérifier** dans Prisma Studio que c'est en BDD
3. **Vérifier** dans `data/content.json` que c'est aussi là
4. **Vérifier** les logs (si JSON fail, ça doit logger)

**Checklist Phase 3** :
- [ ] JsonStore créé et fonctionnel
- [ ] DbStore créé et fonctionnel
- [ ] ContentRepository créé
- [ ] `CONTENT_MODE=dual_write` configuré
- [ ] APIs admin modifiées pour utiliser le repository
- [ ] Test : modification admin → visible en BDD ET JSON
- [ ] Logs fonctionnent si JSON fail

---

## 📖 Phase 4 : Dual-read puis DB only (Lecture puis finalisation)

**Objectif** : Lire depuis BDD avec fallback JSON, puis supprimer JSON

**Durée** : 3-4 jours

### Étape 4.1 : Modifier les APIs publiques

**Fichiers à modifier** :
- `src/app/api/content/metadata/route.ts`
- `src/app/api/content/article/[slug]/route.ts`
- `src/app/api/content/project/[slug]/route.ts`
- `src/app/api/content/pages/[slug]/route.ts` (si existe)

**Changement** :
```ts
// Avant
const content = await readContentFromJson();

// Après
import { getContentRepository } from '@/content/repository';
const repo = getContentRepository();
const content = await repo.getArticleBySlug(siteKey, slug);
```

### Étape 4.2 : Activer dual-read

1. **Changer** `CONTENT_MODE=dual_read` dans `.env`
2. **Tester** : Les APIs lisent depuis BDD
3. **Simuler une erreur DB** : Vérifier que le fallback JSON fonctionne

### Étape 4.3 : Tester en production-like

1. **Vérifier** que toutes les pages se chargent
2. **Vérifier** que l'admin fonctionne
3. **Vérifier** les performances (devrait être plus rapide)

### Étape 4.4 : Passer en DB only

1. **Changer** `CONTENT_MODE=db` dans `.env`
2. **Tester** : Tout fonctionne sans JSON
3. **Optionnel** : Supprimer le code JSON (ou le garder pour rollback)

**Checklist Phase 4** :
- [ ] APIs publiques modifiées pour utiliser le repository
- [ ] `CONTENT_MODE=dual_read` testé
- [ ] Fallback JSON fonctionne si DB down
- [ ] Toutes les pages se chargent correctement
- [ ] Performance améliorée
- [ ] `CONTENT_MODE=db` activé
- [ ] Tout fonctionne sans JSON

---

## 🎓 Ressources pour Apprendre

### Prisma (ORM)
- **Doc officielle** : https://www.prisma.io/docs
- **Tutoriel rapide** : https://www.prisma.io/docs/getting-started

### PostgreSQL
- **Tutoriel basique** : https://www.postgresqltutorial.com
- **Pas besoin d'être expert** : Prisma gère tout pour toi !

### Concepts BDD à connaître (basique)
- **Table** : Comme un fichier Excel avec colonnes
- **Row** : Une ligne dans la table (un article, un projet, etc.)
- **Column** : Une colonne (title, slug, etc.)
- **Index** : Pour accélérer les recherches (comme un index de livre)
- **Relation** : Lien entre tables (ex: un Site a plusieurs Projects)

👉 **Tu n'as pas besoin de tout savoir** : Prisma fait le travail lourd !

---

## ⚠️ Points d'Attention

### 1. Backup avant chaque phase
```bash
# Backup du JSON
cp data/content.json data/backups/content-$(date +%Y%m%d).json

# Backup de la BDD (si possible)
# Via Prisma Studio : Export des données
```

### 2. Tester à chaque étape
- Ne pas avancer si la phase précédente ne fonctionne pas
- Tester en local avant de déployer

### 3. Prendre son temps
- Pas de rush : mieux vaut faire bien que vite
- Si bloqué : demander de l'aide ou chercher dans la doc

### 4. Garder JSON en backup
- Ne pas supprimer `data/content.json` tout de suite
- Le garder comme plan B pendant quelques semaines

---

## 🚀 Ordre d'Exécution Recommandé

### Semaine 1
- **Jour 1-2** : Phase 0 (Nettoyer l'existant)
- **Jour 3-5** : Phase 1 (Setup BDD + Prisma)

### Semaine 2
- **Jour 1-3** : Phase 2 (Migration des données)
- **Jour 4-5** : Phase 3 début (Créer les stores)

### Semaine 3
- **Jour 1-3** : Phase 3 fin (Dual-write)
- **Jour 4-5** : Phase 4 début (Dual-read)

### Semaine 4
- **Jour 1-3** : Phase 4 fin (DB only)
- **Jour 4-5** : Tests finaux + optimisations

---

## ✅ Checklist Finale

Avant de considérer la migration terminée :

- [ ] Phase 0 : Plus aucun fallback `/api/content`
- [ ] Phase 1 : BDD setup, Prisma fonctionnel
- [ ] Phase 2 : Toutes les données migrées
- [ ] Phase 3 : Dual-write fonctionnel
- [ ] Phase 4 : Dual-read puis DB only
- [ ] Performance : Temps de chargement < 500ms
- [ ] Tests : Toutes les pages fonctionnent
- [ ] Admin : Création/modification fonctionne
- [ ] Backup : JSON gardé en backup
- [ ] Documentation : Notes prises pour l'équipe

---

## 🆘 En Cas de Problème

### Erreur Prisma
- Vérifier `DATABASE_URL` dans `.env`
- Vérifier que PostgreSQL est démarré
- Relancer `npx prisma generate`

### Erreur de migration
- Vérifier les logs dans `MigrationRun`
- Relancer en `--dry-run` pour voir l'erreur
- Vérifier la structure JSON

### Performance dégradée
- Vérifier les index dans Prisma Studio
- Vérifier que les requêtes ne chargent pas `blocks` en liste
- Vérifier le cache Next.js

### Besoin d'aide
- Documentation Prisma : https://www.prisma.io/docs
- Stack Overflow : Tag `prisma` ou `postgresql`
- GitHub Issues : Si bug Prisma

---

## 🎉 Résultat Final

Une fois terminé, tu auras :

✅ **Performance** : Chargement initial < 500ms (vs 3-5s avant)  
✅ **Scalabilité** : Support de milliers d'articles sans problème  
✅ **Maintenance** : Code plus propre, plus facile à maintenir  
✅ **Évolutivité** : Base solide pour ajouter de nouvelles features  

**Bravo ! 🚀**

---

**Note** : Cette roadmap est un guide. Adapte-la à ton rythme et tes besoins. L'important c'est de progresser étape par étape, sans stress !

