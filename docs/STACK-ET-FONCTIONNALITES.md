# 🚀 Soliva CMS - Stack Technique & Fonctionnalités Complètes

**Version** : 1.0  
**Date** : Janvier 2025  
**Documentation pour équipe**

---

## 📋 Table des matières

1. [Stack Technique](#stack-technique)
2. [Architecture](#architecture)
3. [Système de Blocs](#système-de-blocs)
4. [Interface Admin](#interface-admin)
5. [Système de Templates](#système-de-templates)
6. [APIs Disponibles](#apis-disponibles)
7. [Fonctionnalités Avancées](#fonctionnalités-avancées)
8. [Configuration & Personnalisation](#configuration--personnalisation)
9. [Performance & Optimisations](#performance--optimisations)

---

## 🛠️ Stack Technique

### Framework & Core
- **Next.js** : 15.3.2 (App Router)
- **React** : 18.2.0
- **TypeScript** : 5.9.2
- **Node.js** : Runtime Node.js pour les APIs

### Styling & UI
- **Tailwind CSS** : 4.1.8 (avec PostCSS)
- **shadcn/ui** : Composants UI réutilisables
- **Radix UI** : Composants accessibles (Dialog, Select, Tabs, etc.)
- **Framer Motion** : 12.23.12 (animations)
- **GSAP** : 3.13.0 (animations avancées)
- **Lenis** : 1.3.1 (smooth scroll)

### Rich Text & Édition
- **TipTap** : 3.1.0 (éditeur WYSIWYG)
- **TipTap Starter Kit** : Extensions de base
- **TipTap Link** : Gestion des liens
- **TipTap Text Align** : Alignement du texte

### Drag & Drop
- **@dnd-kit/core** : 6.3.1 (système de drag & drop)
- **@dnd-kit/sortable** : 10.0.0 (tri de listes)
- **@dnd-kit/utilities** : 3.2.2

### Images & Médias
- **Next.js Image** : Optimisation automatique
- **Sharp** : 0.34.4 (traitement d'images)

### Transitions & Navigation
- **next-view-transitions** : 0.3.4 (transitions de pages)
- **next-themes** : 0.4.6 (gestion des thèmes)

### Carrousels & Sliders
- **embla-carousel-react** : 8.6.0

### Validation & Types
- **Zod** : 4.1.5 (validation de schémas)

### Utilitaires
- **clsx** : 2.1.1 (gestion de classes)
- **tailwind-merge** : 3.3.1 (fusion de classes Tailwind)
- **class-variance-authority** : 0.7.1 (variantes de composants)
- **slugify** : 1.6.6 (génération de slugs)
- **sonner** : 2.0.7 (notifications toast)
- **vaul** : 1.1.2 (drawer/sheet)
- **lucide-react** : 0.542.0 (icônes)
- **react-markdown** : 10.1.0 (rendu markdown)

### Tests
- **Vitest** : 2.1.3
- **@testing-library/react** : 16.0.0
- **@testing-library/jest-dom** : 6.4.8

---

## 🏗️ Architecture

### Structure du Projet

```
soliva/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── admin/                    # Interface d'administration
│   │   │   ├── preview/              # Éditeur visuel (split view)
│   │   │   ├── work/[id]/           # Édition projet individuel
│   │   │   ├── blog/[id]/           # Édition article individuel
│   │   │   └── components/          # Composants admin
│   │   ├── api/                      # Routes API
│   │   │   ├── admin/               # APIs admin
│   │   │   ├── content/             # APIs contenu
│   │   │   └── ai/                  # APIs IA
│   │   ├── blog/                    # Pages blog
│   │   ├── work/                    # Pages portfolio
│   │   └── [slug]/                  # Pages dynamiques
│   ├── blocks/                       # Système de blocs
│   │   ├── auto-declared/           # Blocs auto-déclarés
│   │   ├── BlockRenderer.tsx         # Rendu des blocs
│   │   └── registry.ts              # Registre des blocs
│   ├── components/                   # Composants réutilisables
│   │   ├── ui/                      # Composants shadcn/ui
│   │   └── admin/                   # Composants admin
│   ├── templates/                    # Templates de design
│   │   ├── Starter-Kit/             # Template Starter-Kit
│   │   ├── pearl/                   # Template Pearl
│   │   └── context.tsx              # Contexte template
│   ├── hooks/                        # Hooks React personnalisés
│   ├── lib/                          # Utilitaires
│   └── utils/                        # Fonctions utilitaires
├── data/
│   ├── content.json                  # Contenu principal
│   ├── versions/                     # Versions sauvegardées
│   ├── backups/                      # Backups automatiques
│   └── templates/                    # Contenu par template
├── public/
│   ├── uploads/                      # Fichiers uploadés
│   └── blocks/                       # Assets des blocs
├── docs/                             # Documentation
└── scripts/                          # Scripts d'automatisation
```

### Principes d'Architecture

1. **Système de Blocs Auto-Déclarés** : Chaque bloc s'enregistre automatiquement
2. **Template Overrides** : Possibilité de surcharger un bloc par template
3. **API-First** : Séparation claire entre frontend et backend
4. **Type-Safe** : TypeScript strict avec validation Zod
5. **HMR-Safe** : Hot Module Replacement pour développement rapide

---

## 🧱 Système de Blocs

### Vue d'ensemble

Le CMS utilise un **système de blocs modulaires auto-déclarés**. Chaque bloc est composé de :
- `component.tsx` : Rendu frontend
- `editor.tsx` : Interface d'édition admin
- `index.ts` : Enregistrement du bloc

### Blocs Disponibles (38 blocs)

#### 📝 Blocs de Contenu Textuel

| Bloc | Type | Description | Catégorie |
|------|------|-------------|-----------|
| **ContentBlock** | `content` | Contenu riche WYSIWYG | `content` |
| **H2Block** | `h2` | Titre niveau 2 | `text` |
| **H3Block** | `h3` | Titre niveau 3 | `text` |
| **PageIntroBlock** | `page-intro` | Introduction de page avec titre/description | `content` |
| **QuoteBlock** | `quote` | Citation avec auteur optionnel | `content` |
| **TestimonialBlock** | `testimonial` | Témoignage client | `content` |
| **FAQBlock** | `faq` | Questions/réponses avec accordéon | `content` |
| **ExpandableCard** | `expandable-card` | Carte extensible/rétractable | `interactive` |

#### 🎨 Blocs de Layout

| Bloc | Type | Description | Catégorie |
|------|------|-------------|-----------|
| **TwoColumnsBlock** | `two-columns` | 2 colonnes 50/50 configurable | `layout` |
| **TwoColumns13Block** | `two-columns-13` | 2 colonnes 1/3 - 2/3 | `layout` |
| **ThreeColumnsBlock** | `three-columns` | 3 colonnes égales | `layout` |
| **FourColumnsBlock** | `four-columns` | 4 colonnes égales | `layout` |

#### 🖼️ Blocs Médias

| Bloc | Type | Description | Catégorie |
|------|------|-------------|-----------|
| **ImageBlock** | `image` | Image simple avec alt text | `media` |
| **TwoImagesBlock** | `two-images` | 2 images côte à côte | `media` |
| **GalleryGridBlock** | `gallery-grid` | Grille de galerie d'images | `media` |
| **FullscreenCarouselBlock** | `fullscreen-carousel` | Carrousel plein écran | `media` |
| **MouseImageGalleryBlock** | `mouse-image-gallery` | Galerie contrôlée par la souris | `media` |

#### 🎭 Blocs Animés & Interactifs

| Bloc | Type | Description | Catégorie |
|------|------|-------------|-----------|
| **ScrollSliderBlock** | `scroll-slider` | Slider contrôlé par le scroll | `interactive` |
| **StickyCardsBlock** | `sticky-cards` | Cartes sticky au scroll | `interactive` |
| **StickySectionsCodropsBlock** | `sticky-sections-codrops` | Sections sticky (style Codrops) | `interactive` |
| **PinnedSectionBlock** | `pinned-section` | Section épinglée au scroll | `interactive` |
| **PinnedGridDemoBlock** | `pinned-grid-demo` | Grille épinglée (démo) | `interactive` |
| **PinnedGridExplorationsBlock** | `pinned-grid-explorations` | Grille épinglée (explorations) | `interactive` |
| **InfiniteTextScrollBlock** | `infinite-text-scroll` | Texte défilant infini | `interactive` |

#### 🏢 Blocs Business

| Bloc | Type | Description | Catégorie |
|------|------|-------------|-----------|
| **ProjectsBlock** | `projects` | Grille de projets/portfolio | `data` |
| **ServicesBlock** | `services` | Liste de services | `data` |
| **ServicesSpotlightBlockV2** | `services-spotlight-v2` | Mise en avant services | `data` |
| **LogosBlock** | `logos` | Logos clients/partenaires | `data` |
| **HoverClientsBlock** | `hover-clients` | Clients avec effet hover | `data` |
| **ContactBlock** | `contact` | CTA de contact | `data` |
| **AlliesInCreationBlock** | `allies-in-creation` | Partenaires/alliances | `data` |

#### 🎬 Blocs Hero

| Bloc | Type | Description | Catégorie |
|------|------|-------------|-----------|
| **HeroBlock** | `hero` | Hero section complète | `content` |
| **HeroSimpleBlock** | `hero-simple` | Hero section simple | `content` |
| **HeroFloatingGalleryBlock** | `hero-floating-gallery` | Hero avec galerie flottante | `content` |

#### 🛠️ Blocs Utilitaires

| Bloc | Type | Description | Catégorie |
|------|------|-------------|-----------|
| **TemplateGuidelinesBlock** | `template-guidelines` | Guidelines du template | `content` |

### Fonctionnalités des Blocs

#### Options Communes à Tous les Blocs
- ✅ **Thème** : `light` | `dark` | `auto`
- ✅ **Visibilité** : Masquer/afficher un bloc
- ✅ **Drag & Drop** : Réorganiser les blocs
- ✅ **Duplication** : Dupliquer un bloc
- ✅ **Suppression** : Supprimer un bloc
- ✅ **Édition inline** : Édition directe dans l'admin
- ✅ **Preview live** : Aperçu en temps réel

#### Options Spécifiques par Type

**Blocs de Colonnes** (`two-columns`, `three-columns`, `four-columns`, `two-columns-13`) :
- Espacement entre colonnes : `small` | `medium` | `large` | `xlarge`
- Espacement vertical par colonne : `inherit` | `none` | `small` | `medium` | `large` | `xlarge`
- Alignement vertical : `top` | `center` | `bottom`
- Layout : `left-right` | `right-left` | `stacked-mobile` (pour two-columns)
- Blocs imbriqués : Possibilité d'ajouter n'importe quel bloc dans chaque colonne

**Blocs de Contenu** (`content`, `h2`, `h3`) :
- Éditeur WYSIWYG (TipTap)
- Suggestions IA pour générer du contenu
- Support markdown
- Liens internes/externes

**Blocs Médias** (`image`, `gallery-grid`) :
- Upload multiple
- Optimisation automatique (Sharp)
- Lazy loading
- Responsive images
- Alt text pour SEO

**Blocs Projets** (`projects`) :
- Filtrage par catégorie
- Tri par featured/date
- Affichage grid/liste
- Navigation carrousel
- Support projets admin vs projets publics

### Créer un Nouveau Bloc

```bash
# Structure requise
src/blocks/auto-declared/MonBloc/
├── component.tsx    # Rendu frontend
├── editor.tsx       # Interface admin
└── index.ts         # Enregistrement

# Enregistrement dans index.ts
import { registerAutoBlock } from '../registry';
registerAutoBlock({
  type: 'mon-bloc',
  component: MonBlocComponent,
  editor: MonBlocEditor,
  label: 'Mon Bloc',
  icon: '🎨',
  category: 'content',
  defaultData: { ... }
});
```

---

## 🎛️ Interface Admin

### Pages Admin Disponibles

| Page | Route | Description |
|------|-------|-------------|
| **Dashboard** | `/admin` | Vue d'ensemble et navigation |
| **Visual Editor** | `/admin/preview` | Éditeur visuel split-view (éditeur + preview) |
| **Pages** | `/admin?page=home` | Édition des pages principales |
| **Blog** | `/admin?page=blog` | Gestion des articles |
| **Work** | `/admin?page=work` | Gestion des projets |
| **Projet Individuel** | `/admin/work/[id]` | Édition d'un projet avec blocs |
| **Article Individuel** | `/admin/blog/[id]` | Édition d'un article avec blocs |
| **Métadonnées** | `/admin?page=metadata` | Configuration globale |
| **Typographie** | `/admin?page=typography` | Configuration typographique |
| **Spacing** | `/admin?page=spacing` | Configuration espacements |
| **Palettes** | `/admin?page=palettes` | Gestion des palettes de couleurs |
| **Transitions** | `/admin?page=transitions` | Configuration transitions pages |
| **Scroll Animations** | `/admin?page=scroll-animations` | Animations au scroll |
| **Backup** | `/admin?page=backup` | Gestion des sauvegardes |
| **Footer** | `/admin?page=footer` | Configuration footer |

### Visual Editor (`/admin/preview`)

**Fonctionnalités** :
- ✅ Split-view : Éditeur à gauche, preview live à droite
- ✅ Sélection de page/projet : Dropdown pour choisir ce qu'on édite
- ✅ Plan de page : Vue d'ensemble de tous les blocs
- ✅ Inspection de blocs : Clic sur un bloc dans la preview pour l'éditer
- ✅ Drag & Drop : Réorganisation des blocs
- ✅ Ajout de blocs : Menu contextuel pour ajouter des blocs
- ✅ Sauvegarde automatique : Sauvegarde en temps réel
- ✅ Mode compact : Éditeur compact pour les blocs dans colonnes

**URLs** :
- Page : `/admin/preview?page=home`
- Projet : `/admin/preview?project=projet-slug`

### Édition de Projet/Article Individuel

**Routes** :
- Projet : `/admin/work/[id]`
- Article : `/admin/blog/[id]`

**Fonctionnalités** :
- ✅ Métadonnées : Titre, slug, catégorie, statut, etc.
- ✅ Éditeur de blocs : Même système que le visual editor
- ✅ Preview : Aperçu avant publication
- ✅ Statut : `draft` | `published`
- ✅ Synchronisation : Synchronisé avec le visual editor

### Gestion du Contenu

#### Pages Principales
- **Home** : Page d'accueil
- **Studio** : Page studio/à propos
- **Work** : Liste des projets
- **Blog** : Liste des articles
- **Contact** : Page de contact

#### Projets (Portfolio)
- Liste des projets avec filtres
- Projets individuels avec blocs
- Catégories personnalisables
- Statut : `draft` | `published`
- Featured : Mise en avant
- Métadonnées : Client, année, catégorie

#### Articles (Blog)
- Liste des articles
- Articles individuels avec blocs
- Catégories et tags
- Date de publication
- SEO intégré

---

## 🎨 Système de Templates

### Templates Disponibles

| Template | Clé | Description |
|---------|-----|-------------|
| **Starter-Kit** | `Starter-Kit` | Template moderne et épuré |
| **Pearl** | `pearl` | Template élégant et sophistiqué |

### Structure d'un Template

```
src/templates/{TemplateName}/
├── {TemplateName}-client.tsx    # Composant principal
├── {TemplateName}.css           # Styles spécifiques
└── blocks/                      # Surcharges de blocs
    └── {BlockName}.tsx         # Override d'un bloc
```

### Template Overrides

Possibilité de surcharger un bloc pour un template spécifique :

```typescript
// src/templates/Starter-Kit/blocks/ProjectsBlock.tsx
export default function ProjectsBlockStarterKit({ data }) {
  // Version customisée pour Starter-Kit
}

// Enregistrement dans registry.ts
const TEMPLATE_OVERRIDES = {
  'Starter-Kit': {
    projects: ProjectsBlockStarterKit,
  },
};
```

### Configuration Template

Chaque template peut avoir :
- **Layout** : `compact` | `standard` | `wide`
- **Palette de couleurs** : Personnalisable
- **Typographie** : Configuration spécifique
- **Transitions** : Style de transitions
- **Animations** : Animations au scroll

---

## 🔌 APIs Disponibles

### APIs Admin

#### Contenu
- `GET /api/admin/content` : Récupérer tout le contenu
- `PUT /api/admin/content` : Sauvegarder le contenu
- `POST /api/admin/reset-content` : Réinitialiser le contenu

#### Upload
- `POST /api/admin/upload` : Upload de fichiers (images, etc.)

#### Templates
- `GET /api/admin/templates` : Liste des templates
- `GET /api/admin/templates/[templateKey]/content` : Contenu d'un template
- `POST /api/admin/templates/apply` : Appliquer un template
- `POST /api/admin/templates/generate` : Générer un template
- `DELETE /api/admin/templates/[templateKey]` : Supprimer un template

#### Versions & Backups
- `GET /api/admin/versions` : Liste des versions
- `POST /api/admin/versions/cleanup` : Nettoyer les anciennes versions

#### Preview
- `POST /api/admin/preview/create` : Créer une révision temporaire
- `GET /api/admin/preview/[id]` : Récupérer une révision
- `POST /api/admin/preview/enable` : Activer le mode preview
- `POST /api/admin/preview/disable` : Désactiver le mode preview

#### Duplication & Suppression
- `POST /api/admin/duplicate` : Dupliquer un élément
- `DELETE /api/admin/delete` : Supprimer un élément

### APIs Contenu Public

#### Métadonnées (Léger)
- `GET /api/content/metadata` : Métadonnées uniquement (< 100 Ko)
  - Retourne : Pages, projets (sans blocs), articles (sans contenu complet)

#### Contenu Complet
- `GET /api/content` : Contenu complet (lourd, ~40 Mo)
  - Retourne : Tout le contenu avec blocs complets

#### Contenu Spécifique
- `GET /api/content/article/[slug]` : Article complet avec blocs
- `GET /api/content/project/[slug]` : Projet complet avec blocs

### APIs IA

#### Génération de Contenu
- `POST /api/admin/ai/suggest-block-content` : Suggérer du contenu pour un bloc
- `POST /api/admin/ai/suggest-description` : Suggérer une description
- `POST /api/admin/ai/suggest-service-description` : Suggérer description service
- `POST /api/admin/ai/suggest-filters` : Suggérer des filtres
- `POST /api/admin/ai/suggest-categories` : Suggérer des catégories
- `POST /api/ai/generate-article` : Générer un article complet
- `POST /api/ai/suggest-articles` : Suggérer des idées d'articles

#### SEO
- `POST /api/ai/seo` : Optimisation SEO
- `POST /api/ai/seo/insert-links` : Insertion de liens internes

#### Palettes
- `POST /api/admin/ai/generate-palette` : Générer une palette de couleurs
- `GET /api/admin/ai/audit-palettes` : Auditer les palettes

#### Profil IA
- `GET /api/admin/ai/profile` : Profil de complétude IA

---

## ⚙️ Fonctionnalités Avancées

### Système de Spacing Global

**Configuration** : `/admin?page=spacing`

**Options** :
- **Mode** : `auto` (basé sur layout) | `custom` (valeur personnalisée)
- **Section Y** : Espacement vertical entre sections
- **Gap par défaut** : `sm` | `md` | `lg` | `xl`
- **Tailles de gap** :
  - `Gap sm` : Petit (par défaut 0.5rem)
  - `Gap md` : Moyen (par défaut 1rem)
  - `Gap lg` : Grand (par défaut 1.5rem)
  - `Gap xl` : Très grand (par défaut 4rem)

**Variables CSS générées** :
- `--gap-sm` : Gap petit
- `--gap-md` : Gap moyen
- `--gap-lg` : Gap grand
- `--gap-xl` : Gap très grand
- `--gap` : Gap par défaut (selon configuration)
- `--section` : Espacement vertical entre sections

### Système de Typographie

**Configuration** : `/admin?page=typography`

**Options** :
- Configuration par niveau : `h1`, `h2`, `h3`, `h4`, `p`
- Pour chaque niveau :
  - Taille de police
  - Poids (font-weight)
  - Hauteur de ligne (line-height)
  - Tracking (letter-spacing)
  - Couleur personnalisée

**Variables CSS générées** :
- Classes Tailwind dynamiques selon configuration
- Couleurs personnalisées via CSS variables

### Système de Palettes

**Configuration** : `/admin?page=palettes`

**Fonctionnalités** :
- Gestion de plusieurs palettes
- Génération IA de palettes
- Preview en temps réel
- Application globale ou par section

### Système de Transitions

**Configuration** : `/admin?page=transitions`

**Modes disponibles** :
- `curtain` : Rideau qui se lève
- `fade` : Fondu
- `slide` : Glissement
- `none` : Aucune transition

**Configuration** :
- Durée
- Easing
- Prévisualisation

### Scroll Animations

**Configuration** : `/admin?page=scroll-animations`

**Types d'animations** :
- Fade in
- Slide up
- Scale
- Rotate
- Custom (via GSAP)

**Options** :
- Trigger : Viewport, élément, etc.
- Delay
- Duration
- Easing

### Système de Versions & Backups

**Fonctionnalités** :
- Sauvegarde automatique à chaque modification
- Historique des versions
- Restauration d'une version précédente
- Backups manuels
- Nettoyage automatique des anciennes versions

**API** :
- `GET /api/admin/versions` : Liste des versions
- `POST /api/admin/versions/cleanup` : Nettoyer

### Mode Preview

**Fonctionnalités** :
- Création de révisions temporaires
- Preview sans publier
- Partage de lien de preview
- Activation/désactivation

**Workflow** :
1. Créer une révision : `POST /api/admin/preview/create`
2. Activer le mode : `POST /api/admin/preview/enable`
3. Accéder via : `/?preview={id}`
4. Désactiver : `POST /api/admin/preview/disable`

---

## 🎯 Configuration & Personnalisation

### Métadonnées Globales

**Configuration** : `/admin?page=metadata`

**Options** :
- **Titre du site**
- **Description**
- **Logo** : Upload et gestion
- **Favicon**
- **Layout** : `compact` | `standard` | `wide`
- **Template actif** : Choix du template
- **Réseaux sociaux** : URLs des réseaux
- **SEO global** : Meta tags par défaut

### Configuration Footer

**Configuration** : `/admin?page=footer`

**Options** :
- Liens de navigation
- Textes de copyright
- Liens réseaux sociaux
- Colonnes personnalisables

### Configuration Navigation

**Options** :
- Menu principal
- Liens personnalisés
- Slugs personnalisés pour pages principales

---

## 🚀 Performance & Optimisations

### Optimisations Frontend

1. **API Métadonnées** : Chargement léger (< 100 Ko) au lieu de contenu complet (40 Mo+)
2. **Lazy Loading** : Images chargées à la demande
3. **Image Optimization** : Sharp pour optimisation automatique
4. **Code Splitting** : Next.js App Router
5. **Static Generation** : Pages statiques quand possible
6. **View Transitions** : Transitions fluides entre pages

### Optimisations Backend

1. **Cache** : Cache des réponses API
2. **Compression** : Compression des réponses
3. **Lazy Loading** : Chargement à la demande du contenu complet

### Métriques

- **Temps de chargement initial** : < 500 ms (avec metadata API)
- **Temps de chargement complet** : Variable selon contenu
- **Taille metadata** : < 100 Ko
- **Taille contenu complet** : ~40 Mo (à optimiser)

---

## 📦 Scripts Disponibles

```bash
# Développement
npm run dev              # Serveur de développement

# Build & Production
npm run build            # Build de production
npm start                # Serveur de production

# Utilitaires
npm run generate-blocks   # Générer imports de blocs
npm run lint             # Linter

# Tests
npm test                 # Tests unitaires
npm run test:watch       # Tests en mode watch

# Performance
npm run lighthouse       # Audit Lighthouse
npm run lighthouse:work  # Audit page work
npm run lighthouse:blog  # Audit page blog
npm run lighthouse:all   # Audit toutes les pages
npm run lighthouse:quick # Audit rapide

# Typographie
npm run check:typography # Vérifier santé typographie
```

---

## 🔐 Sécurité

### Mesures en Place

- ✅ Validation des données (Zod)
- ✅ Sanitization du contenu HTML
- ✅ Protection CSRF (Next.js)
- ✅ Validation des uploads
- ✅ Limitation de taille des fichiers

### Bonnes Pratiques

- Ne jamais exposer les clés API dans le frontend
- Valider toutes les entrées utilisateur
- Sanitizer le HTML avant affichage
- Limiter la taille des uploads

---

## 📚 Documentation Complémentaire

### Guides Principaux
- `README.md` : Vue d'ensemble
- `README-AGENTS.md` : Guide des agents
- `README-SCALABLE-BLOCKS.md` : Système de blocs
- `README-CONTENT-SYSTEM.md` : Système de contenu
- `README-ADMIN-SYSTEM.md` : Système admin

### Guides par Domaine
- `docs/agents/AGENT-BLOCKS.md` : Création de blocs
- `docs/agents/AGENT-CONTENT.md` : Rédaction & SEO
- `docs/agents/AGENT-UI.md` : Interface admin
- `docs/TEMPLATE-BLOCK-OVERRIDES.md` : Surcharges de blocs
- `docs/ADMIN-THEME-SYSTEM.md` : Système de thèmes
- `docs/SCROLL-ANIMATIONS.md` : Animations scroll
- `docs/TRANSITIONS-SYSTEM.md` : Système de transitions

---

## 🆘 Support & Contribution

### En cas de problème

1. Consulter la documentation dans `docs/`
2. Vérifier les logs de la console
3. Tester avec `npm run build` pour détecter les erreurs TypeScript
4. Consulter les guides des agents pour les domaines spécifiques

### Contribution

- Suivre les conventions de nommage
- Documenter les nouvelles fonctionnalités
- Tester avant de commit
- Respecter l'architecture existante

---

**Dernière mise à jour** : Janvier 2025  
**Version du CMS** : 1.0

