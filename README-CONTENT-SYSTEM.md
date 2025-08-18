# Système de Contenu JSON - Soliva

## Vue d'ensemble

Ce système permet de gérer tout le contenu éditable du site via un fichier JSON centralisé, préparant l'arrivée d'un futur back-office. Aucune écriture n'est possible à cette étape - lecture seule.

## Architecture

### Fichiers créés

```
/data/
  content.json          # Contenu principal du site
/types/
  content.ts            # Types TypeScript du schéma
/lib/
  content.ts            # Fonctions de lecture et validation
/src/app/api/content/
  route.ts              # API GET /api/content
/src/app/debug-content/
  page.tsx              # Page de debug /debug-content
```

### Composants modifiés

- `src/app/layout.js` - Métadonnées et navigation
- `src/components/Nav.jsx` - Menu de navigation
- `src/app/page.jsx` + `home-client.jsx` - Page d'accueil
- `src/app/contact/page.jsx` + `contact-client.jsx` - Page contact
- `src/app/studio/page.jsx` + `studio-client.jsx` - Page studio
- `src/app/work/page.jsx` + `work-client.jsx` - Page work
- `src/app/blog/page.jsx` + `blog-client.jsx` - Page blog
- `src/components/BriefGenerator.jsx` - Générateur de brief

## Zones éditables détectées

### Navigation (toutes les pages)
- **nav.logo**: "soliva"
- **nav.items**: ["home", "work", "studio", "blog", "contact"]
- **nav.location**: "paris, le havre"

### Home (/)
- **hero.title**: "soliva"
- **hero.subtitle**: "creative studio.\ndigital & brand strategy."

### Contact (/contact)
- **hero.title**: "Contact Us"
- **sections.collaborations.title**: "Collaborations"
- **sections.collaborations.email**: "studio@nuvoro.com"
- **sections.inquiries.title**: "Inquiries"
- **sections.inquiries.email**: "support@nuvoro.com"
- **socials**: ["Instagram", "Twitter", "LinkedIn"]
- **briefGenerator.placeholder**: "Décris ton projet ici..."
- **briefGenerator.button**: "Générer le brief"
- **briefGenerator.loading**: "Génération..."
- **briefGenerator.resultTitle**: "Brief généré :"

### Studio (/studio)
- **hero.title**: "Le studio"
- **content.description**: Texte de présentation
- **content.image.src**: "/studio.jpg"
- **content.image.alt**: "Team at work in Nuvoro's creative space"

### Work (/work)
- **hero.title**: "selected work"
- **filters**: ["All", "Strategy", "Brand", "Digital", "IA"]
- **description**: Description de la section
- **projects**: Array de projets avec title, description, category, image, alt, slug

### Blog (/blog)
- **hero.title**: "Journal"
- **description**: "Réflexions, analyses et insights..."
- **articles**: Array de 27 articles avec id et title

### Layout (toutes les pages)
- **metadata.title**: "NextJS Page Transitions | Codegrid"
- **metadata.description**: "NextJS Page Transitions | Codegrid"

## Fonctionnalités

### 1. Lecture automatique du contenu
- `readContent()` lit le JSON et valide sa structure
- Utilisation dans les Server Components pour récupérer le contenu
- Passage des props aux Client Components

### 2. Recréation automatique du seed
- `ensureDataFile()` crée le dossier `/data` et `content.json` si absent
- Ne remplace pas le fichier s'il existe déjà
- Seed complet avec toutes les valeurs actuelles du site

### 3. Validation des données
- Vérification de la présence des pages principales
- Validation des sections critiques (home.hero.title, nav.items)
- Messages d'erreur clairs en cas de problème

### 4. API de lecture
- `GET /api/content` retourne le JSON complet
- Headers de cache désactivés pour toujours avoir les dernières données
- Gestion d'erreurs avec messages détaillés

### 5. Page de debug
- `/debug-content` affiche le JSON formatté
- Liste des pages et sections disponibles
- Aperçu des titres et compteurs (projets, articles)
- Gestion des erreurs de lecture

## Utilisation

### Dans un Server Component
```tsx
import { readContent } from '@/lib/content';

export default async function MaPage() {
  const content = await readContent();
  
  return <MonComposant content={content.maPage} />;
}
```

### Dans un Client Component
```tsx
export default function MonComposant({ content }) {
  return (
    <h1>{content?.hero?.title || 'Titre par défaut'}</h1>
  );
}
```

### API
```bash
curl http://localhost:3000/api/content
```

## Tests

### URLs de test
- `http://localhost:3000/` - Page d'accueil
- `http://localhost:3000/contact` - Page contact
- `http://localhost:3000/studio` - Page studio
- `http://localhost:3000/work` - Page work
- `http://localhost:3000/blog` - Page blog
- `http://localhost:3000/api/content` - API JSON
- `http://localhost:3000/debug-content` - Page de debug

### Test de recréation du seed
1. Supprimer `data/content.json`
2. Recharger n'importe quelle page
3. Le fichier est automatiquement recréé avec le seed

### Critères d'acceptation
- ✅ `npm run dev` fonctionne
- ✅ `/api/content` renvoie le JSON (200)
- ✅ `/debug-content` affiche le JSON et liste les pages
- ✅ Suppression de `data/content.json` → recréation automatique
- ✅ Pages existantes s'affichent exactement comme avant
- ✅ Valeurs viennent désormais du JSON
- ✅ Aucune régression visuelle

## Contraintes techniques

- Runtime Node.js pour tout ce qui lit le fichier
- TypeScript strict
- Pas de dépendance externe
- Utilisation de `node:fs/promises` et `node:path`
- Aucune écriture (pas de POST/PUT/DELETE)
- Pas d'auth ni d'upload
- CSS et layouts existants non modifiés
- Seulement la source des données changée

## Prochaines étapes (Étape 2)

- Interface d'administration
- Upload d'images
- Édition en temps réel
- Sauvegarde automatique
- Gestion des versions 