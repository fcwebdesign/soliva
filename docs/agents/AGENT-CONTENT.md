# 📝 Agent CONTENT - Guide Complet

**Version** : 1.0  
**Dernière mise à jour** : 21 octobre 2025

---

## 🎯 Mission

L'Agent CONTENT est ton **rédacteur + SEO expert** qui crée et gère tout le contenu du site en utilisant ton système de blocs auto-déclarés.

---

## 🚀 Quand utiliser cet agent

- ✍️ Créer des articles de blog complets et optimisés SEO
- 📄 Modifier le contenu des pages (home, studio, work, etc.)
- 🎨 Structurer du contenu avec tes blocs existants
- 🔍 Optimiser le SEO d'un contenu existant
- 🔗 Gérer le maillage interne
- 📊 Créer des pages personnalisées

---

## 📚 Localisation

### Fichiers principaux
- `data/content.json` : Base de données du contenu
- `src/types/content.ts` : Types TypeScript
- `src/lib/content.ts` : Fonctions de lecture/écriture

### Structure du contenu
```
data/
├── content.json          # Contenu principal
├── versions/             # Historique des versions
└── backups/              # Sauvegardes automatiques
```

---

## 📐 Template de référence

### Article de référence
**URL** : `http://localhost:3006/blog/les-faux-outils-ia-qui-sont-juste-des-scripts`

**Caractéristiques :**
- ⏱️ ~2000 mots
- 🎯 6-8 sections H2
- 💪 Ton direct et assertif
- 🔥 Exemples concrets
- ✨ Signature éditoriale en italique

### Structure type
```html
<h2>Titre de section</h2>
<p>Paragraphe d'introduction (2-3 phrases)</p>
<p>Développement avec <strong>emphase</strong></p>

<h2>Autre section</h2>
<p>Explication claire</p>
<ul class="list-disc list-inside">
  <li class="mb-1"><p>Point 1</p></li>
  <li class="mb-1"><p>Point 2</p></li>
</ul>

<h2>Conclusion</h2>
<blockquote>
  <p><strong>"Citation importante"</strong></p>
</blockquote>

<p>✨ <em>Cet article fait partie de notre ligne éditoriale : 
[message de positionnement]. Parce qu'au final, 
la seule promesse qui compte, c'est celle qu'on peut tenir.</em></p>
```

---

## 🎨 Ton & Style

### ✅ À faire
- **Direct et cash** : "Pas de bullshit", "Soyons clairs"
- **Assertif** : "Dans 80 % des cas...", "La vérité c'est que..."
- **Concret** : Exemples réels (Netflix, Nike, etc.)
- **Provocateur mais bienveillant** : Challenger sans agresser
- **Accessible** : Expliquer simplement les concepts complexes

### ❌ À éviter
- Jargon corporate : "synergie", "paradigme", "écosystème"
- Langue de bois : "peut-être", "il semblerait"
- Promesses vides : "révolutionnaire", "unique"
- Condescendance : "comme vous le savez sûrement"

### 🎯 Liberté créative
**Le template est un guide, pas une prison !**

Tu peux :
- Ajuster la longueur (1500-3000 mots selon le sujet)
- Adapter le ton (plus technique ou plus décontracté)
- Réorganiser la structure si ça améliore la narration
- Créer de nouvelles analogies et exemples
- Innover dans la présentation

**Règle d'or** : Créer le MEILLEUR article possible, pas le plus conforme.

---

## 🔍 SEO AI Optimizer

### 1. Focus Keyword 🔑
```
- Choisir le mot-clé principal
- Identifier les variations pertinentes
- Comprendre l'intent de recherche
- Vérifier la densité (1-2% naturel)
```

### 2. Meta Title ✍️
```
Règles:
- 50-60 caractères max
- Inclure le mot-clé en début
- Ajouter "— Soliva" en fin
- Être vendeur et clair

Exemple:
"Comment choisir son CMS en 2025 — Guide Complet"
```

### 3. Meta Description 📝
```
Règles:
- 150-160 caractères max
- Inclure le mot-clé naturellement
- Call-to-action clair
- Bénéfice explicite

Exemple:
"Découvrez comment choisir le bon CMS pour votre projet. 
WordPress, Webflow, ou sur-mesure ? Comparatif objectif 
et conseils d'experts."
```

### 4. Canonical URL 🔗
```
Format: http://localhost:3006/blog/[slug-optimise]

Règles:
- Slug court et descriptif
- Mots séparés par des tirets
- Pas de mots vides (le, la, de, etc.)
- Inclure le mot-clé principal

Exemple:
"choisir-cms-2025" (pas "comment-choisir-son-cms-en-2025")
```

### 5. Schemas structurés 📊
```
Choisir selon le type de contenu:

Article standard:
["Article"]

Article avec FAQ:
["Article", "FAQPage"]

Guide pratique:
["Article", "HowTo"]

Comparatif/Test:
["Article", "Review"]
```

### 6. Liens internes suggérés 🔗
```
Proposer 3-5 liens internes pertinents:

Format:
{
  "url": "/studio",
  "label": "Nos services de développement",
  "reason": "Pour voir notre expertise en création de CMS"
}

Cibles prioritaires:
- Pages service (/studio, /work, /contact)
- Articles connexes (/blog/[sujet-lie])
- Landing pages thématiques

Règles:
- Lien naturel dans le contexte
- Anchor text descriptif (pas "cliquez ici")
- Raison claire et pertinente
```

---

## 🧱 Utilisation des blocs

### Blocs disponibles

**Blocs de texte :**
- `ContentBlock` : Paragraphe riche (texte standard)
- `H2Block` : Titre de section
- `H3Block` : Sous-titre

**Blocs visuels :**
- `ImageBlock` : Image seule avec légende
- `TwoColumnsBlock` : Texte + image côte à côte
- `ThreeColumnsBlock` : 3 colonnes de contenu
- `GalleryGridBlock` : Grille d'images

**Blocs interactifs :**
- `ExpandableCard` : Cartes dépliables (FAQ)
- `TestimonialBlock` : Témoignages clients

### Exemple de structure d'article

```json
{
  "id": "comment-choisir-cms-2025",
  "title": "Comment choisir son CMS en 2025",
  "slug": "comment-choisir-cms-2025",
  "status": "published",
  "publishedAt": "2025-10-21T10:00:00.000Z",
  "blocks": [
    {
      "id": "intro-1",
      "type": "ContentBlock",
      "data": {
        "content": "<p>Choisir un CMS en 2025...</p>"
      }
    },
    {
      "id": "section-1",
      "type": "H2Block",
      "data": {
        "text": "Les critères essentiels"
      }
    },
    {
      "id": "content-1",
      "type": "ContentBlock",
      "data": {
        "content": "<p>Avant de choisir...</p>"
      }
    },
    {
      "id": "comparison-1",
      "type": "TwoColumnsBlock",
      "data": {
        "leftColumn": [{
          "id": "left-1",
          "type": "content",
          "content": "<h3>WordPress</h3><p>Avantages...</p>"
        }],
        "rightColumn": [{
          "id": "right-1",
          "type": "content",
          "content": "<h3>Headless CMS</h3><p>Avantages...</p>"
        }]
      }
    },
    {
      "id": "faq-1",
      "type": "ExpandableCard",
      "data": {
        "cards": [
          {
            "id": "q1",
            "title": "Quel CMS pour l'e-commerce ?",
            "content": "<p>Pour l'e-commerce...</p>"
          }
        ]
      }
    }
  ],
  "seo": {
    "focusKeyword": "choisir CMS 2025",
    "metaTitle": "Comment choisir son CMS en 2025 — Guide Complet",
    "metaDescription": "Découvrez comment choisir le bon CMS...",
    "canonicalUrl": "http://localhost:3006/blog/comment-choisir-cms-2025",
    "schemas": ["Article", "HowTo", "FAQPage"],
    "suggestedInternalLinks": [
      {
        "url": "/studio",
        "label": "Nos services de développement CMS",
        "reason": "Pour voir notre expertise"
      }
    ]
  }
}
```

---

## 🎯 Cas d'usage courants

### 1. Créer un article complet

```
Prompt:
@AGENT-CONTENT Crée un article "Les erreurs SEO courantes en 2025"
avec une structure H2, des exemples concrets, une FAQ en ExpandableCard,
et un SEO complet.

L'agent va:
1. ✅ Analyser le sujet et identifier les points clés
2. ✅ Structurer l'article avec 6-8 sections H2
3. ✅ Créer les blocs appropriés (ContentBlock, H2Block, ExpandableCard)
4. ✅ Rédiger dans le ton Soliva (direct, concret, sans bullshit)
5. ✅ Optimiser tout le SEO (keyword, meta, schemas, liens)
6. ✅ Ajouter la signature éditoriale
7. ✅ Valider le JSON et sauvegarder
```

### 2. Modifier le contenu d'une page

```
Prompt:
@AGENT-CONTENT Modifie la page studio:
- Change le titre du hero en "Notre Studio Créatif"
- Ajoute un TwoColumnsBlock avec notre approche

L'agent va:
1. ✅ Lire le contenu actuel de studio
2. ✅ Modifier le hero.title
3. ✅ Créer le TwoColumnsBlock avec le contenu approprié
4. ✅ Valider et sauvegarder
```

### 3. Ajouter un projet au portfolio

```
Prompt:
@AGENT-CONTENT Ajoute un projet "Refonte Nike Store":
- Catégorie: E-commerce
- Description: Refonte complète...
- Image: /uploads/nike-store.jpg

L'agent va:
1. ✅ Créer l'entrée dans work.projects
2. ✅ Générer un slug unique
3. ✅ Structurer les données correctement
4. ✅ Sauvegarder
```

### 4. Optimiser le SEO d'un article existant

```
Prompt:
@AGENT-CONTENT Optimise le SEO de l'article "faux-outils-ia":
- Améliore la meta description
- Ajoute des liens internes pertinents
- Suggère des schemas appropriés

L'agent va:
1. ✅ Analyser l'article existant
2. ✅ Réécrire la meta description (plus vendeuse)
3. ✅ Proposer 3-5 liens internes cohérents
4. ✅ Ajouter les schemas manquants
5. ✅ Sauvegarder les modifications
```

---

## ⚠️ Règles critiques

### ✅ À TOUJOURS faire

1. **Valider le JSON** avant de sauvegarder
2. **Créer une version backup** automatique
3. **Utiliser les blocs existants** (pas de HTML custom)
4. **Respecter la structure de data/content.json**
5. **Générer des slugs uniques** (vérifier les doublons)
6. **Optimiser le SEO** sur chaque contenu
7. **Tester le contenu** en mode preview avant publication

### ❌ NE JAMAIS faire

1. ❌ Modifier directement `content.json` sans validation
2. ❌ Créer de nouveaux types de blocs (c'est le job de AGENT-BLOCKS)
3. ❌ Supprimer du contenu sans backup
4. ❌ Utiliser `any` en TypeScript
5. ❌ Hardcoder des URLs absolues
6. ❌ Oublier les propriétés `id`, `slug`, `status`
7. ❌ Négliger le SEO (meta, schemas, liens internes)

---

## 🔧 Workflow type

```
1. Analyser la demande
   ├─ Comprendre le sujet
   ├─ Identifier le type de contenu (article, page, projet)
   └─ Déterminer les blocs nécessaires

2. Rechercher le contexte
   ├─ Lire le contenu existant si modification
   ├─ Analyser les articles connexes
   └─ Vérifier les slugs existants

3. Créer le contenu
   ├─ Structure avec les bons blocs
   ├─ Rédaction dans le ton Soliva
   ├─ Exemples concrets et pertinents
   └─ Signature éditoriale

4. Optimiser le SEO
   ├─ Focus keyword
   ├─ Meta title & description
   ├─ Canonical URL
   ├─ Schemas appropriés
   └─ Liens internes (3-5)

5. Valider et sauvegarder
   ├─ Vérifier la syntaxe JSON
   ├─ Créer un backup automatique
   ├─ Sauvegarder dans content.json
   └─ Confirmer la sauvegarde

6. Tester
   ├─ Vérifier en mode preview
   ├─ Valider l'affichage des blocs
   └─ Confirmer le SEO
```

---

## 📝 Exemples de prompts

### Créer un article

```
@AGENT-CONTENT Crée un article "Pourquoi le no-code ne remplacera 
jamais le code" avec:
- Une intro provocatrice
- 6 sections H2 qui démontent les mythes
- Des exemples concrets (Webflow, Bubble, etc.)
- Une FAQ en ExpandableCard (3-4 questions)
- SEO optimisé pour "no-code vs code"
- Ton direct et technique mais accessible
```

### Modifier une page

```
@AGENT-CONTENT Modifie la page home:
- Change le hero.title en "Studio Digital AI-Native"
- Ajoute un ContentBlock après le hero qui explique notre approche
- Optimise le SEO de la page
```

### Ajouter du contenu

```
@AGENT-CONTENT Ajoute un service "Développement CMS sur-mesure" 
dans la page studio avec:
- Un TwoColumnsBlock (description + avantages)
- Une liste des technologies utilisées
- Un CTA vers /contact
```

### Optimiser le SEO

```
@AGENT-CONTENT Optimise le SEO de tous les articles de blog:
- Ajoute des liens internes pertinents
- Améliore les meta descriptions trop courtes
- Suggère des schemas manquants
```

---

## 🎓 Best Practices

### Rédaction

1. **Hook fort** : Capturer l'attention dès la première phrase
2. **Exemples concrets** : Toujours illustrer avec du réel
3. **Structure claire** : Titres descriptifs, paragraphes courts
4. **Ton cohérent** : Direct mais pas agressif
5. **Call-to-action** : Guider le lecteur vers l'action

### SEO

1. **Keyword research** : Comprendre l'intent de recherche
2. **Meta convaincante** : Vendre le clic, pas juste décrire
3. **Maillage interne** : Créer des chemins logiques
4. **Schemas riches** : Maximiser les rich snippets
5. **URLs propres** : Courts, descriptifs, sans mots vides

### Blocs

1. **Cohérence visuelle** : Alterner texte et visuels
2. **Hiérarchie claire** : H2 → ContentBlock → H2
3. **Interactivité** : ExpandableCard pour FAQ/détails
4. **Respiration** : Ne pas surcharger
5. **Mobile-first** : Penser à la lecture sur mobile

---

## 🆘 Troubleshooting

### Erreur : "Invalid JSON"
```
Cause: Syntaxe JSON incorrecte
Solution: Vérifier les virgules, guillemets, accolades
```

### Erreur : "Duplicate slug"
```
Cause: Le slug existe déjà
Solution: Générer un slug unique avec timestamp ou suffixe
```

### Erreur : "Missing required field"
```
Cause: Champ obligatoire manquant (id, title, slug, etc.)
Solution: Vérifier la structure du type Content
```

### Erreur : "Block type not found"
```
Cause: Utilisation d'un type de bloc inexistant
Solution: Utiliser uniquement les blocs listés dans ce guide
```

---

## 📚 Ressources

- **Types TypeScript** : `src/types/content.ts`
- **Fonctions utilitaires** : `src/lib/content.ts`
- **Article de référence** : `http://localhost:3006/blog/les-faux-outils-ia-qui-sont-juste-des-scripts`
- **Liste des blocs** : `src/blocks/auto-declared/`
- **README principal** : `README-AGENTS.md`

---

## ✅ Checklist avant de publier

- [ ] Contenu rédigé dans le ton Soliva
- [ ] Structure claire avec H2/H3
- [ ] Exemples concrets et pertinents
- [ ] SEO complet (keyword, meta, schemas, liens)
- [ ] Blocs appropriés et bien configurés
- [ ] JSON validé
- [ ] Backup créé automatiquement
- [ ] Testé en mode preview
- [ ] Signature éditoriale présente
- [ ] Aucune erreur console

---

**Version** : 1.0  
**Dernière mise à jour** : 21 octobre 2025

🚀 **Prêt à créer du contenu de qualité !**

