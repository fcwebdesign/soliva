# Système d'Administration - Étape 2

## 🎯 Vue d'ensemble

Système d'administration complet avec authentification Basic Auth, édition de contenu, upload d'images, prévisualisation et gestion des versions.

## 🔐 Authentification

### Configuration
Créer un fichier `.env.local` à la racine du projet :
```env
ADMIN_USER=admin
ADMIN_PASS=password123
```

### Protection
- Middleware protège `/admin` et `/api/admin/*`
- Basic Auth avec header `WWW-Authenticate`
- Credentials via variables d'environnement

## 🏗️ Architecture

### Fichiers créés/modifiés

```
/src/lib/
  auth.ts                    # Utilitaire Basic Auth
  content.ts                 # Étendu avec writeContent(), versioning
/src/middleware.ts           # Protection des routes admin
/src/app/api/admin/
  content/route.ts           # GET/PUT du contenu
  upload/route.ts            # POST upload d'images
  versions/route.ts          # GET liste, POST revert
  preview/enable/route.ts    # GET active Draft Mode
  preview/disable/route.ts   # GET désactive Draft Mode
/src/app/admin/
  page.tsx                   # Interface principale
  components/
    AdminLayout.tsx          # Layout de l'admin
    PageSelector.tsx         # Sélection de page
    BlockEditor.tsx          # Éditeur de blocs
    MediaUploader.tsx        # Upload d'images
    VersionList.tsx          # Gestion des versions
    SaveBar.tsx              # Barre de sauvegarde
/data/versions/              # Sauvegardes horodatées
/public/uploads/             # Images uploadées
```

## ⚙️ Fonctionnalités

### 1. Édition de contenu
- **Interface structurée** : Formulaires typés par page/block
- **Validation** : Structure globale et sections critiques
- **Écriture atomique** : Fichier temporaire puis rename
- **Lock léger** : Évite les writes concurrents

### 2. Upload d'images
- **Sécurité** : Extensions autorisées (jpg, png, webp, svg)
- **Limite** : 5 MB max par fichier
- **Nom unique** : Timestamp + hash MD5
- **Path traversal** : Protection contre les noms malveillants

### 3. Versioning
- **Sauvegarde automatique** : Avant chaque écriture
- **Format** : `content-YYYYMMDD-HHmmss.json`
- **Revert** : Restauration avec backup préalable
- **Liste** : Tri par date décroissante

### 4. Draft Mode
- **Activation** : `/api/admin/preview/enable?to=/page`
- **Désactivation** : `/api/admin/preview/disable`
- **Redirection** : Vers la page demandée
- **Temps réel** : Lecture directe du JSON

## 🎨 Interface d'administration

### Layout
- Header avec titre et lien vers le site
- Grille responsive (éditeur + sidebar)
- SaveBar fixe en bas

### Composants
- **PageSelector** : Grille de pages avec chemins
- **BlockEditor** : Formulaires adaptés par type
- **MediaUploader** : Drag & drop + preview
- **VersionList** : Liste + boutons revert
- **SaveBar** : Save + Preview + status

### UX
- **Formulaires simples** : Labels clairs, validations basiques
- **Feedback visuel** : Status de sauvegarde, erreurs
- **Responsive** : Mobile-friendly
- **Optimistic UI** : Mise à jour immédiate

## 🔧 API Endpoints

### `/api/admin/content`
- **GET** : Retourne le contenu actuel
- **PUT** : Met à jour le contenu avec validation

### `/api/admin/upload`
- **POST** : Upload d'image (multipart/form-data)
- Retourne `{ url, filename, size, type }`

### `/api/admin/versions`
- **GET** : Liste des versions disponibles
- **POST** : Revert à une version `{ filename }`

### `/api/admin/preview/enable`
- **GET** : Active Draft Mode + redirection
- Query param `to` pour la page cible

### `/api/admin/preview/disable`
- **GET** : Désactive Draft Mode + redirection vers `/`

## 🛡️ Sécurité

### Upload
- Extensions whitelistées
- Taille maximale
- Normalisation des noms
- Protection path traversal

### Écriture
- Validation de structure
- Whitelist des clés autorisées
- Lock contre writes concurrents
- Messages d'erreur clairs

### Auth
- Basic Auth via middleware
- Variables d'environnement
- Headers appropriés

## 📋 Critères d'acceptation

### ✅ Authentification
- `/admin` demande login/mot de passe
- Credentials via `.env.local`
- Protection de toutes les routes admin

### ✅ Édition
- Modification de titre → persistance dans `data/content.json`
- Validation de structure
- Messages d'erreur clairs

### ✅ Upload
- Upload image → URL `/uploads/...`
- Assignation à un champ image
- Sauvegarde avec l'image

### ✅ Preview
- Activation → page publique reflète les changements
- Draft Mode actif
- Désactivation → retour au rendu publié

### ✅ Versions
- Dossier `/data/versions` alimenté
- Revert à une version précédente
- Backup avant revert

### ✅ Concurrence
- Pas de crash si double-clic sur "Enregistrer"
- Lock léger en mémoire

## 🚀 Comment tester

### 1. Configuration
```bash
# Créer .env.local
echo "ADMIN_USER=admin" > .env.local
echo "ADMIN_PASS=password123" >> .env.local

# Lancer le serveur
npm run dev
```

### 2. Authentification
- Aller sur `http://localhost:3004/admin`
- Saisir `admin` / `password123`
- Vérifier l'accès à l'interface

### 3. Édition + Sauvegarde
- Sélectionner une page (ex: Home)
- Modifier le titre
- Cliquer "Enregistrer"
- Vérifier la persistance dans `data/content.json`

### 4. Upload d'image
- Aller sur Studio ou Work
- Cliquer sur l'upload d'image
- Sélectionner une image
- Vérifier l'URL `/uploads/...`
- Assigner à un champ et sauvegarder

### 5. Preview on/off
- Modifier un contenu
- Cliquer "Aperçu" → ouvre la page en Draft Mode
- Vérifier les changements en temps réel
- Cliquer "Désactiver l'aperçu" → retour au publié

### 6. Versions
- Faire plusieurs modifications + sauvegardes
- Vérifier les fichiers dans `/data/versions/`
- Cliquer "Revenir à cette version"
- Confirmer le revert

## 📝 Notes techniques

### Limitations MVP
- Pas de compression d'images
- Pas de redimensionnement automatique
- Pas de gestion des métadonnées EXIF
- Pas de CDN pour les uploads

### Améliorations futures
- Interface drag & drop pour réorganiser
- Éditeur WYSIWYG pour le contenu riche
- Gestion des médias (suppression, galerie)
- Export/import de contenu
- Notifications en temps réel
- Historique des actions utilisateur

### Performance
- Lock léger en mémoire (pas de DB)
- Écriture atomique pour éviter la corruption
- Cache désactivé pour le contenu admin
- Validation côté serveur uniquement

## 🔗 URLs de test

- `http://localhost:3004/admin` - Interface d'administration
- `http://localhost:3004/api/admin/content` - API contenu
- `http://localhost:3004/api/admin/upload` - API upload
- `http://localhost:3004/api/admin/versions` - API versions
- `http://localhost:3004/api/admin/preview/enable?to=/` - Activer preview
- `http://localhost:3004/api/admin/preview/disable` - Désactiver preview

Le système est maintenant complet et prêt pour la production ! 🎉 