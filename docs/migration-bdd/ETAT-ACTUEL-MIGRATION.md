# 📊 État Actuel de la Migration BDD

**Date de vérification** : 21 décembre 2024  
**Dernière mise à jour** : Prisma + migrations exécutées (soliva / starter-kit / pearl)

---

## ✅ Phase 1 : Setup BDD + Prisma - **TERMINÉE**

### Ce qui est fait :

- [x] **Schéma Prisma créé** : `prisma/schema.prisma` ✅
  - Tous les modèles définis (Site, Page, Article, Project, NavigationItem, Footer, Asset, Revision, MigrationRun)
  - Enums corrects (ContentStatus, EntityType, ProjectVisibility)
  - Relations et index configurés

- [x] **Prisma installé** : Version 5.18.0 ✅
  - `@prisma/client` : ^5.18.0
  - `prisma` (dev) : ^5.18.0

- [x] **Script de migration créé** : `scripts/migrate-content-to-db.js` ✅
  - Script complet et fonctionnel
  - Gère l'import de toutes les entités
  - Idempotent (peut être relancé)

- [x] **Prisma Studio fonctionnel** ✅
  - Script helper : `scripts/prisma-studio.sh`
  - Commande npm : `npm run studio` (Node 20)
  - Problème Node 22 → bascule en Node 20 résolue

### À vérifier :
- [x] **DATABASE_URL configurée** dans `.env.local` (Supabase OK)
- [x] **Tables créées en BDD** (`prisma db push`) ✅
- [x] **Données migrées** (script exécuté) ✅

---

## ✅ Phase 2 : Migration des Données - **TERMINÉE**

### Ce qui est fait :
- [x] Script exécuté pour `soliva` (data/content.json)
- [x] Script exécuté pour `starter-kit` (data/templates/Starter-Kit/content.json)
- [x] Script exécuté pour `pearl` (data/templates/pearl/content.json)
- [x] Données visibles dans Prisma Studio (`npm run studio`) : sites, pages, projets (public/admin), articles, nav/footer (pearl)

### Rappel des volumes attendus (exemple) :
- soliva : ~5 pages core, 11 projects public, 10 admin, 27 articles
- starter-kit : idem (copie)
- pearl : nav 7 items, footer présent, 4 projects public, 4 admin, 2 articles

---

## ❌ Phase 3 : Dual-write - **NON COMMENCÉE**

### Ce qui manque :

- [ ] **Structure des stores** : `src/content/store/` n'existe pas
  - [ ] `types.ts` (interface ContentStore)
  - [ ] `JsonStore.ts` (implémentation JSON)
  - [ ] `DbStore.ts` (implémentation BDD)

- [ ] **ContentRepository** : `src/content/repository.ts` n'existe pas
  - [ ] Classe ContentRepository
  - [ ] Helper `getContentRepository()`
  - [ ] Gestion des modes (json, dual_write, dual_read, db)

- [ ] **Configuration** : `CONTENT_MODE` non configuré
  - [ ] Ajouter `CONTENT_MODE=dual_write` dans `.env.local`

- [ ] **APIs admin modifiées**
  - [ ] `src/app/api/admin/content/route.ts`
  - [ ] Autres APIs admin si elles existent

### Prochaine étape :

Créer la structure complète selon `docs/migration-bdd/soliva-migration-bdd.md` section 4.

---

## ❌ Phase 4 : Dual-read puis DB only - **NON COMMENCÉE**

### Ce qui manque :

- [ ] **APIs publiques modifiées**
  - [ ] `src/app/api/content/metadata/route.ts`
  - [ ] `src/app/api/content/article/[slug]/route.ts`
  - [ ] `src/app/api/content/project/[slug]/route.ts`

- [ ] **Mode dual_read testé**
- [ ] **Mode db activé**

---

## 📋 Résumé Global

### ✅ Fait (Phase 1)
- Infrastructure Prisma setup
- Schéma complet
- Script de migration prêt
- Prisma Studio fonctionnel

### ⚠️ À vérifier (Phase 1)
- DATABASE_URL configurée
- Tables créées
- Données migrées

### ❌ À faire (Phases 2-4)
- Phase 2 : Exécuter la migration des données
- Phase 3 : Créer les stores et repository (dual-write)
- Phase 4 : Modifier les APIs publiques (dual-read puis db)

---

## 🎯 Prochaines Actions Immédiates

1. **Vérifier DATABASE_URL**
   ```bash
   # Vérifier que .env.local contient DATABASE_URL
   cat .env.local | grep DATABASE_URL
   ```

2. **Créer les tables si nécessaire**
   ```bash
   npx prisma db push
   ```

3. **Vérifier si les données sont déjà migrées**
   ```bash
   npm run studio
   # Vérifier dans Prisma Studio si les tables contiennent des données
   ```

4. **Si pas de données, exécuter la migration**
   ```bash
   npm run migrate:content
   ```

5. **Ensuite, commencer Phase 3** : Créer les stores et repository

---

## 📚 Documentation de Référence

- **Guide principal** : `docs/migration-bdd/GUIDE-ACCOMPAGNEMENT-MIGRATION.md`
- **Roadmap** : `docs/migration-bdd/ROADMAP-MIGRATION-BDD.md`
- **Spec technique** : `docs/migration-bdd/soliva-migration-bdd.md`
- **Troubleshooting Prisma Studio** : `docs/TROUBLESHOOTING-PRISMA-STUDIO.md`

---

**État global** : **Phase 1 terminée** (infrastructure), **Phase 2 à vérifier** (migration des données), **Phases 3-4 non commencées** (code application)
