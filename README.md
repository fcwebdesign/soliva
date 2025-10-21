# 🌟 Soliva - AI-Native Studio CMS

Un CMS Next.js moderne avec système de blocs modulaires, interface admin intuitive et approche multi-agents pour le développement.

---

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) dans ton navigateur.

### Admin

Accède à l'interface admin sur [http://localhost:3000/admin](http://localhost:3000/admin)

### Build

```bash
npm run build
npm start
```

---

## 🤖 Approche Multi-Agents

Ce projet utilise une **approche par agents spécialisés** pour améliorer l'efficacité du développement avec l'IA.

### Agents disponibles

| Agent | Domaine | Documentation |
|-------|---------|---------------|
| 🧱 **BLOCKS** | Blocs de contenu | `docs/agents/AGENT-BLOCKS.md` |
| 📝 **CONTENT** | Contenu & SEO | `README-CONTENT-SYSTEM.md` |
| 🎨 **UI** | Interface admin | `docs/ADMIN-THEME-SYSTEM.md` |
| 🔧 **API** | Backend & APIs | À créer |
| 🏗️ **ARCHITECTURE** | Config & structure | `docs/AGENTS-GUIDE.md` |

**📖 Guide complet** : `README-AGENTS.md`

---

## 📚 Documentation

### Guides principaux

- **🤖 [Guide des Agents](README-AGENTS.md)** - Approche multi-agents
- **🧱 [Système de Blocs](README-SCALABLE-BLOCKS.md)** - Blocs modulaires
- **📝 [Système de Contenu](README-CONTENT-SYSTEM.md)** - Gestion du contenu
- **⚙️ [Système Admin](README-ADMIN-SYSTEM.md)** - Interface d'administration

### Guides par domaine

- **🧱 Blocs** : `docs/agents/AGENT-BLOCKS.md`
- **🎨 Thèmes** : `docs/ADMIN-THEME-SYSTEM.md`
- **📸 Logo Upload** : `docs/LOGO_DRAG_DROP.md`
- **🧩 Service Blocks** : `docs/service-offerings-blocks.md`

---

## 🏗️ Architecture

### Structure du projet

```
soliva/
├── src/
│   ├── app/                    # Pages Next.js App Router
│   │   ├── admin/             # Interface admin
│   │   ├── api/               # Routes API
│   │   ├── blog/              # Blog
│   │   └── [slug]/            # Pages dynamiques
│   ├── blocks/                # Système de blocs
│   │   └── auto-declared/     # Blocs auto-déclarés ✅
│   ├── components/            # Composants réutilisables
│   │   └── ui/                # Composants UI (shadcn)
│   └── lib/                   # Utilitaires
├── data/
│   ├── content.json           # Contenu du site
│   ├── versions/              # Versions sauvegardées
│   └── backups/               # Backups automatiques
├── public/
│   └── uploads/               # Fichiers uploadés
├── docs/                      # Documentation
│   └── agents/                # Docs par agent
└── scripts/                   # Scripts d'automatisation
```

### Stack technique

- **Framework** : Next.js 15.3
- **UI** : React 19 + Tailwind CSS
- **Components** : shadcn/ui
- **Rich Text** : TipTap
- **Images** : Next.js Image + Sharp
- **TypeScript** : En migration progressive
- **Validation** : Zod (à venir)

---

## 🧱 Système de Blocs

Le CMS utilise un système de **blocs modulaires auto-déclarés** :

### Blocs disponibles (15)

- ✅ **ContentBlock** - Contenu riche
- ✅ **H2Block / H3Block** - Titres
- ✅ **QuoteBlock** - Citations
- ✅ **TestimonialBlock** - Témoignages ⭐ *NOUVEAU*
- ✅ **ImageBlock** - Images
- ✅ **GalleryGridBlock** - Galeries
- ✅ **LogosBlock** - Logos clients
- ✅ **ServicesBlock** - Services
- ✅ **ProjectsBlock** - Portfolio
- ✅ **ContactBlock** - Contact CTA
- ✅ **ExpandableCard** - Cartes extensibles
- ✅ **TwoColumnsBlock** - 2 colonnes
- ✅ **ThreeColumnsBlock** - 3 colonnes
- ✅ **FourColumnsBlock** - 4 colonnes

### Créer un nouveau bloc

```bash
# Activer l'agent BLOCKS
@AGENT-BLOCKS Crée un bloc [NomDuBloc] avec [fonctionnalités]
```

**📖 Guide complet** : `docs/agents/AGENT-BLOCKS.md`

---

## 📝 Gestion du Contenu

### Via l'interface admin

1. Accède à `/admin`
2. Sélectionne une page
3. Ajoute/modifie des blocs
4. Sauvegarde et prévisualise

### Via le JSON

Le contenu est stocké dans `data/content.json` :

```json
{
  "home": {
    "title": "Accueil",
    "blocks": [
      {
        "id": "block-1",
        "type": "content",
        "content": "<p>Mon contenu</p>"
      }
    ]
  }
}
```

**📖 Guide complet** : `README-CONTENT-SYSTEM.md`

---

## 🎨 Thèmes

Le site supporte les thèmes **light** et **dark** :

- **Auto** : Suit le thème du système
- **Light** : Thème clair forcé
- **Dark** : Thème sombre forcé

Chaque bloc peut avoir son propre thème ou suivre le thème global.

**📖 Guide complet** : `docs/ADMIN-THEME-SYSTEM.md`

---

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev                    # Serveur dev

# Build
npm run build                  # Build production
npm start                      # Serveur production

# Maintenance
npm run generate-blocks        # Régénérer les imports de blocs
```

---

## 🎯 Roadmap

### Phase 1 : Fondations ✅ TERMINÉE (21/10/2025)

- ✅ Unification système de blocs
- ✅ Documentation agents
- ✅ Test bloc (TestimonialBlock)
- ✅ Fichier .cursorrules

### Phase 2 : Qualité 🔄 EN COURS

- 🔄 TypeScript strict mode
- 🔄 Validation Zod
- 🔄 Nettoyage fichiers .backup
- 🔄 Migration .jsx → .tsx

### Phase 3 : Optimisation 📋 À VENIR

- 📋 Performance des blocs
- 📋 SEO avancé
- 📋 Audit accessibilité
- 📋 Tests E2E

---

## 🐛 Troubleshooting

### Le build échoue

```bash
# Vérifier les erreurs TypeScript
npm run build

# Nettoyer le cache
rm -rf .next
npm run build
```

### L'admin ne charge pas

```bash
# Vérifier le fichier content.json
cat data/content.json | jq .

# Vérifier les logs
npm run dev
```

### Un bloc ne s'affiche pas

1. Vérifier qu'il est enregistré dans `src/blocks/auto-declared/index.ts`
2. Vérifier la console du navigateur
3. Consulter `docs/agents/AGENT-BLOCKS.md`

---

## 🤝 Contribution

### Workflow avec agents

1. **Identifier le domaine** (Blocks, Content, UI, API, Architecture)
2. **Activer l'agent approprié** via `.cursorrules`
3. **Consulter la doc** de l'agent
4. **Coder** en suivant les conventions
5. **Tester** avec `npm run build`
6. **Documenter** si nécessaire

**📖 Guide complet** : `README-AGENTS.md`

---

## 📞 Support

- **Documentation** : `/docs/`
- **Issues** : GitHub Issues
- **Agents** : `README-AGENTS.md`

---

## 📄 License

Propriétaire - Soliva © 2025

---

## 🙏 Remerciements

Construit avec :
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TipTap](https://tiptap.dev/)

---

**Version** : 1.0  
**Dernière mise à jour** : 21 octobre 2025
