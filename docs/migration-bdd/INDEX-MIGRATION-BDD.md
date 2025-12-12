# 📚 Index Documentation Migration BDD

**Guide de navigation** pour trouver rapidement l'information nécessaire

---

## 📖 Documents Disponibles

### 1. **README.md** (dans ce dossier)
**Rôle** : Vue d'ensemble du dossier  
**Quand l'utiliser** : Pour comprendre l'organisation du dossier

### 2. **INDEX-MIGRATION-BDD.md** (ce fichier)
**Rôle** : Navigation et vue d'ensemble  
**Quand l'utiliser** : Pour savoir quel document consulter

### 3. **GUIDE-ACCOMPAGNEMENT-MIGRATION.md** ⭐ PRINCIPAL
**Rôle** : Guide détaillé étape par étape pour l'accompagnement  
**Quand l'utiliser** : Pendant l'implémentation, étape par étape  
**Contenu** :
- Chaque étape détaillée avec commandes exactes
- Vérifications à chaque étape
- Exemples de code
- Points de blocage courants

### 4. **ROADMAP-MIGRATION-BDD.md**
**Rôle** : Vue d'ensemble et planning  
**Quand l'utiliser** : Pour comprendre la structure globale et le planning  
**Contenu** :
- Vue d'ensemble des 5 phases
- Durées estimées
- Checklist par phase
- Ressources d'apprentissage

### 5. **soliva-migration-bdd.md**
**Rôle** : Spec technique complète (référence)  
**Quand l'utiliser** : Pour comprendre l'architecture, copier du code, référence technique  
**Contenu** :
- Schéma Prisma complet
- Code des stores et repository
- Script de migration complet
- Architecture détaillée

### 6. **PROMPT-PERFORMANCE-SCALABILITE.md**
**Rôle** : Contexte et justification de la migration  
**Quand l'utiliser** : Pour comprendre pourquoi on fait cette migration  
**Contenu** :
- Constat des problèmes
- Solutions proposées
- Objectifs de performance

---

## 🎯 Parcours Recommandé

### Pour Commencer
1. **Lire** `README.md` : Vue d'ensemble du dossier
2. **Lire** `ROADMAP-MIGRATION-BDD.md` : Comprendre la vue d'ensemble
3. **Lire** `GUIDE-ACCOMPAGNEMENT-MIGRATION.md` Phase 0 : Première étape concrète

### Pendant l'Implémentation
1. **Suivre** `GUIDE-ACCOMPAGNEMENT-MIGRATION.md` : Étape par étape
2. **Consulter** `soliva-migration-bdd.md` : Pour copier du code ou comprendre l'architecture

### En Cas de Blocage
1. **Vérifier** `GUIDE-ACCOMPAGNEMENT-MIGRATION.md` : Section "Points de Blocage Courants"
2. **Consulter** `soliva-migration-bdd.md` : Section correspondante

---

## 📋 Par Phase

### Phase 0 : Nettoyer l'Existant
- **Guide** : `GUIDE-ACCOMPAGNEMENT-MIGRATION.md` → Phase 0
- **Roadmap** : `ROADMAP-MIGRATION-BDD.md` → Phase 0
- **Durée** : 1-2 jours

### Phase 1 : Setup BDD + Prisma
- **Guide** : `GUIDE-ACCOMPAGNEMENT-MIGRATION.md` → Phase 1
- **Roadmap** : `ROADMAP-MIGRATION-BDD.md` → Phase 1
- **Spec** : `soliva-migration-bdd.md` → Section 3 (Prisma schema)
- **Durée** : 2-3 jours

### Phase 2 : Migration des Données
- **Guide** : `GUIDE-ACCOMPAGNEMENT-MIGRATION.md` → Phase 2
- **Roadmap** : `ROADMAP-MIGRATION-BDD.md` → Phase 2
- **Spec** : `soliva-migration-bdd.md` → Section 10 (Script de migration)
- **Durée** : 2-3 jours

### Phase 3 : Dual-write
- **Guide** : `GUIDE-ACCOMPAGNEMENT-MIGRATION.md` → Phase 3
- **Roadmap** : `ROADMAP-MIGRATION-BDD.md` → Phase 3
- **Spec** : `soliva-migration-bdd.md` → Section 4 (Repository pattern)
- **Durée** : 3-4 jours

### Phase 4 : Dual-read puis DB only
- **Guide** : `GUIDE-ACCOMPAGNEMENT-MIGRATION.md` → Phase 4
- **Roadmap** : `ROADMAP-MIGRATION-BDD.md` → Phase 4
- **Spec** : `soliva-migration-bdd.md` → Section 11-13
- **Durée** : 3-4 jours

---

## 🔍 Recherche Rapide

### "Comment installer PostgreSQL ?"
→ `GUIDE-ACCOMPAGNEMENT-MIGRATION.md` → Phase 1 → Étape 1.1

### "Comment créer le schéma Prisma ?"
→ `GUIDE-ACCOMPAGNEMENT-MIGRATION.md` → Phase 1 → Étape 1.3  
→ `soliva-migration-bdd.md` → Section 3 (code à copier)

### "Comment migrer les données ?"
→ `GUIDE-ACCOMPAGNEMENT-MIGRATION.md` → Phase 2  
→ `soliva-migration-bdd.md` → Section 10 (script complet)

### "Comment créer les stores ?"
→ `GUIDE-ACCOMPAGNEMENT-MIGRATION.md` → Phase 3 → Étape 3.1-3.4  
→ `soliva-migration-bdd.md` → Section 4 (code complet)

### "Erreur Prisma 'Can't reach database'"
→ `GUIDE-ACCOMPAGNEMENT-MIGRATION.md` → Section "Points de Blocage Courants"

### "Quelle est l'architecture ?"
→ `soliva-migration-bdd.md` → Section 1 (Architecture cible)

### "Pourquoi faire cette migration ?"
→ `PROMPT-PERFORMANCE-SCALABILITE.md`

---

## 📊 État d'Avancement

**Template de suivi** (à remplir au fur et à mesure) :

### Phase 0 : Nettoyer l'Existant
- [ ] Étape 0.1 : Identifier les fallbacks
- [ ] Étape 0.2 : Modifier les templates
- [ ] Étape 0.3 : Modifier les éditeurs
- [ ] Étape 0.4 : Tester
- [ ] Étape 0.5 : Vérifier la taille

### Phase 1 : Setup BDD + Prisma
- [ ] Étape 1.1 : Installer PostgreSQL
- [ ] Étape 1.2 : Installer Prisma
- [ ] Étape 1.3 : Configurer le schéma
- [ ] Étape 1.4 : Configurer DATABASE_URL
- [ ] Étape 1.5 : Créer la BDD
- [ ] Étape 1.6 : Générer client et créer tables
- [ ] Étape 1.7 : Vérifier avec Prisma Studio
- [ ] Étape 1.8 : Créer un site de test

### Phase 2 : Migration des Données
- [ ] Étape 2.1 : Créer le script
- [ ] Étape 2.2 : Adapter extractAll()
- [ ] Étape 2.3 : Installer tsx
- [ ] Étape 2.4 : Tester dry-run
- [ ] Étape 2.5 : Migration réelle
- [ ] Étape 2.6 : Vérifier dans Prisma Studio
- [ ] Étape 2.7 : Vérifier la cohérence

### Phase 3 : Dual-write
- [ ] Étape 3.1 : Créer la structure
- [ ] Étape 3.2 : Créer l'interface
- [ ] Étape 3.3 : Créer JsonStore
- [ ] Étape 3.4 : Créer DbStore
- [ ] Étape 3.5 : Créer ContentRepository
- [ ] Étape 3.6 : Créer helper
- [ ] Étape 3.7 : Configurer CONTENT_MODE
- [ ] Étape 3.8 : Modifier APIs admin
- [ ] Étape 3.9 : Tester dual-write

### Phase 4 : Dual-read puis DB only
- [ ] Étape 4.1 : Modifier APIs publiques
- [ ] Étape 4.2 : Activer dual-read
- [ ] Étape 4.3 : Tester fallback
- [ ] Étape 4.4 : Passer en DB only

---

## 💡 Conseils pour l'Accompagnement

### Structure de la Doc
- **GUIDE-ACCOMPAGNEMENT-MIGRATION.md** : À suivre étape par étape
- **soliva-migration-bdd.md** : Référence technique, code à copier
- **ROADMAP-MIGRATION-BDD.md** : Vue d'ensemble, planning

### Workflow Recommandé
1. **Avant chaque phase** : Lire la section correspondante dans le guide
2. **Pendant l'implémentation** : Suivre les étapes une par une
3. **Pour copier du code** : Aller dans `soliva-migration-bdd.md`
4. **En cas de blocage** : Vérifier la section "Points de Blocage"

### Points Importants
- ✅ Vérifier chaque étape avant de passer à la suivante
- ✅ Ne pas hésiter à revenir en arrière si problème
- ✅ Prendre des notes sur les adaptations faites
- ✅ Faire des backups réguliers

---

## 📝 Notes

**Cette documentation sera mise à jour** au fur et à mesure de l'avancement de la migration.

**Dernière mise à jour** : [Date à remplir]

**État actuel** : [Phase en cours à remplir]

---

**Bon courage pour la migration ! 🚀**

