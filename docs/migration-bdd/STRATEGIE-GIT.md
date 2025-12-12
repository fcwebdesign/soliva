# 🔀 Stratégie Git pour la Migration BDD

**Objectif** : Travailler de façon safe avec Git pendant la migration  
**Principe** : Branches séparées, commits fréquents, possibilité de rollback

---

## 🌿 Structure de Branches Recommandée

### Branches Principales

```
main (ou master)
  └── migration-bdd/
      ├── phase-0-cleanup
      ├── phase-1-setup
      ├── phase-2-migration
      ├── phase-3-dual-write
      └── phase-4-dual-read
```

### Stratégie

1. **`main`** : Code stable, production-ready
2. **`migration-bdd`** : Branche principale de la migration (longue durée)
3. **`phase-X-*`** : Branches de travail par phase (courte durée, merge dans `migration-bdd`)

---

## 📋 Workflow Recommandé

### Étape 1 : Créer la branche principale

```bash
# S'assurer d'être sur main et à jour
git checkout main
git pull origin main

# Créer la branche principale de migration
git checkout -b migration-bdd

# Push pour sauvegarder
git push -u origin migration-bdd
```

### Étape 2 : Travailler par phase

Pour chaque phase, créer une branche de travail :

```bash
# Exemple pour Phase 0
git checkout migration-bdd
git checkout -b phase-0-cleanup

# Travailler, commiter fréquemment
git add .
git commit -m "Phase 0: Supprimer fallback /api/content dans Starter-Kit"

# Quand la phase est terminée, merger dans migration-bdd
git checkout migration-bdd
git merge phase-0-cleanup

# Supprimer la branche de travail (optionnel)
git branch -d phase-0-cleanup
```

### Étape 3 : Commits fréquents et descriptifs

**Bonnes pratiques** :
- Commiter souvent (après chaque étape fonctionnelle)
- Messages clairs : `Phase X: Description de ce qui a été fait`
- Petits commits plutôt qu'un gros commit

**Exemples de messages** :
```
Phase 0: Supprimer fallback /api/content dans Starter-Kit
Phase 0: Supprimer fallback /api/content dans pearl
Phase 1: Installer Prisma et configurer schéma
Phase 1: Créer les tables en BDD
Phase 2: Créer script de migration JSON → DB
Phase 2: Adapter extractAll() pour adminProjects
```

### Étape 4 : Sauvegarder régulièrement

```bash
# Push régulièrement vers le remote
git push origin migration-bdd

# Ou push la branche de travail
git push origin phase-0-cleanup
```

---

## 🎯 Branches par Phase

### Phase 0 : Cleanup
**Branche** : `phase-0-cleanup`  
**Objectif** : Supprimer les fallbacks `/api/content`  
**Commits attendus** :
- Suppression fallback dans chaque fichier
- Tests de vérification

### Phase 1 : Setup
**Branche** : `phase-1-setup`  
**Objectif** : Installer Prisma, créer les tables  
**Commits attendus** :
- Installation Prisma
- Configuration schéma
- Création tables
- Test de connexion

### Phase 2 : Migration
**Branche** : `phase-2-migration`  
**Objectif** : Importer les données JSON  
**Commits attendus** :
- Script de migration
- Adaptation extractAll()
- Migration dry-run
- Migration réelle
- Vérification

### Phase 3 : Dual-write
**Branche** : `phase-3-dual-write`  
**Objectif** : Écrire dans BDD ET JSON  
**Commits attendus** :
- Création stores (JsonStore, DbStore)
- Création ContentRepository
- Modification APIs admin
- Tests dual-write

### Phase 4 : Dual-read puis DB only
**Branche** : `phase-4-dual-read`  
**Objectif** : Lire depuis BDD, puis DB only  
**Commits attendus** :
- Modification APIs publiques
- Activation dual-read
- Tests fallback
- Activation DB only

---

## 🔄 Merge dans Main

### Quand merger ?

**Critères** :
- ✅ Phase complète et testée
- ✅ Pas d'erreurs
- ✅ Documentation à jour
- ✅ Code review (si équipe)

### Processus de merge

```bash
# S'assurer que migration-bdd est à jour
git checkout migration-bdd
git pull origin migration-bdd

# Tester une dernière fois
npm run build
npm run dev  # Vérifier que tout fonctionne

# Merger dans main
git checkout main
git pull origin main
git merge migration-bdd

# Push
git push origin main
```

### En cas de conflit

```bash
# Résoudre les conflits
git status  # Voir les fichiers en conflit
# Éditer les fichiers, résoudre les conflits
git add .
git commit -m "Résolution conflits migration-bdd"
```

---

## 🚨 Rollback en Cas de Problème

### Rollback d'un commit

```bash
# Voir l'historique
git log --oneline

# Revenir en arrière (sans perdre les changements)
git reset --soft HEAD~1

# Ou revenir complètement (perte des changements)
git reset --hard HEAD~1
```

### Rollback d'une branche

```bash
# Revenir à un commit spécifique
git checkout migration-bdd
git reset --hard <commit-hash>

# Ou revenir à main
git checkout main
git branch -D migration-bdd  # Supprimer la branche problématique
git checkout -b migration-bdd  # Recréer depuis main
```

### Rollback de la BDD

Si la migration BDD a causé des problèmes :

```bash
# Option 1 : Restaurer depuis backup JSON
cp data/backups/content-YYYYMMDD.json data/content.json

# Option 2 : Supprimer les données en BDD et re-migrer
npx prisma studio  # Supprimer manuellement
# Ou
npx tsx scripts/migrate-json-to-db.ts  # Re-migrer
```

---

## 📝 Checklist Git par Phase

### Avant de commencer une phase

- [ ] Être sur la branche `migration-bdd`
- [ ] `git pull` pour être à jour
- [ ] Créer une branche `phase-X-*`
- [ ] Vérifier que tout fonctionne

### Pendant la phase

- [ ] Commiter fréquemment
- [ ] Messages de commit clairs
- [ ] Push régulièrement
- [ ] Tester après chaque modification importante

### Fin de phase

- [ ] Tous les tests passent
- [ ] Documentation à jour
- [ ] Merger dans `migration-bdd`
- [ ] Push `migration-bdd`
- [ ] Supprimer la branche de travail (optionnel)

---

## 🎓 Commandes Git Essentielles

### Voir l'état
```bash
git status                    # État des fichiers
git log --oneline -10         # Derniers commits
git branch -a                 # Toutes les branches
```

### Créer/Changer de branche
```bash
git checkout -b nouvelle-branche    # Créer et changer
git checkout branche-existante      # Changer de branche
git branch                          # Lister les branches locales
```

### Commiter
```bash
git add .                           # Ajouter tous les fichiers
git add fichier.ts                  # Ajouter un fichier spécifique
git commit -m "Message descriptif"  # Commiter
git push origin nom-branche          # Push vers remote
```

### Merger
```bash
git checkout branche-destination
git merge branche-source            # Merger une branche
```

### Annuler
```bash
git reset --soft HEAD~1             # Annuler dernier commit (garder changements)
git reset --hard HEAD~1             # Annuler dernier commit (perdre changements)
git checkout -- fichier.ts          # Annuler changements d'un fichier
```

---

## 💡 Conseils

### 1. Commits atomiques
- Un commit = une fonctionnalité/étape
- Facilite le rollback si problème

### 2. Messages clairs
- Format : `Phase X: Action effectuée`
- Exemple : `Phase 0: Supprimer fallback dans Starter-Kit`

### 3. Push régulièrement
- Ne pas attendre la fin de la phase
- Sauvegarder le travail régulièrement

### 4. Tester avant de merger
- `npm run build` doit passer
- `npm run dev` doit fonctionner
- Vérifier que les fonctionnalités marchent

### 5. Documentation à jour
- Commiter les changements de doc en même temps que le code
- Mettre à jour les checklists

---

## 🆘 En Cas de Problème Git

### "J'ai fait une erreur dans mon commit"
```bash
# Modifier le dernier commit
git commit --amend -m "Nouveau message"
```

### "J'ai commité sur la mauvaise branche"
```bash
# Déplacer le commit
git log --oneline -5  # Trouver le hash du commit
git checkout bonne-branche
git cherry-pick <commit-hash>
git checkout mauvaise-branche
git reset --hard HEAD~1  # Supprimer le commit de la mauvaise branche
```

### "J'ai perdu mes changements"
```bash
# Voir les changements récents
git reflog
# Revenir à un état précédent
git checkout <commit-hash>
```

---

## ✅ Checklist Avant de Commencer

- [ ] Compris la stratégie de branches
- [ ] Créé la branche `migration-bdd`
- [ ] Push la branche vers remote
- [ ] Prêt à créer les branches de travail par phase

---

**Bon courage avec Git ! 🚀**

