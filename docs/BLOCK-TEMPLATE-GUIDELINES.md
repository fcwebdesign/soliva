# Bloc Template Guidelines (référence)

Bloc servant de squelette pour tester le câblage admin : toutes les options sont exposées individuellement (titres, description, CTA, image, notes détaillées, thème, layout) et testables en mode compact ou normal.

## Type
- `template-guidelines`

## Dossier
- `src/blocks/auto-declared/TemplateGuidelinesBlock/`

## Fichiers
- `index.ts` : enregistrement dans le registre auto-déclaré (`registerAutoBlock`).
- `component.tsx` : rendu front (layout split/stacked, CTA, image).
- `editor.tsx` : éditeur admin (compact + normal) avec drag & drop des notes détaillées.
- `styles.css` : styles dédiés du bloc.

## Schéma de données
```ts
type TemplateGuidelinesData = {
  theme?: 'light' | 'dark' | 'auto';
  layout?: 'stacked' | 'split';
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  image?: { src?: string; alt?: string; aspectRatio?: string; hidden?: boolean };
  details?: Array<{
    id: string;
    title?: string;
    summary?: string;
    content?: string;
    alt?: string;
    aspectRatio?: string;
    image?: { src?: string; alt?: string; aspectRatio?: string };
    hidden?: boolean;
    link?: string; // page de destination
  }>;
};
```

## defaultData
- `theme: 'auto'`
- `layout: 'split'`
- `title`, `subtitle`, `description`, `ctaText`, `ctaHref` vides
- `image`: vide avec ratio 16:9, alt pré-rempli `Placeholder`
- `details`: aucune entrée par défaut (liste vide au départ)
- `featureToggle: false`

## Rendu front (`component.tsx`)
- Supporte `layout` : `split` (texte + image) ou `stacked` (texte puis image).
- Affiche titre, sous-titre, description, CTA, image (placeholder si vide, sans badge de ratio).
- Les notes détaillées ne sont pas rendues en front (bloc de référence côté admin).
- Attributs `data-block-type` et `data-block-theme` pour l'intégration. Espacements et gaps héritent des réglages généraux (`--section`, `--gap`). Couleurs : fallback lisible en admin (fond blanc/texte foncé), et sur le front (`body:not(.admin-page)`) les tokens de la palette (`--card`, `--foreground`, `--muted-foreground`, `--border`, `--primary`, `--primary-foreground`) reprennent la couleur auto choisie dans Colors.

### Typographie globale (OBLIGATOIRE)
**Tous les textes doivent utiliser la configuration typographique globale** depuis `content.metadata.typography` :

1. **Charger la config** :
   ```tsx
   const [fullContent, setFullContent] = useState<any>(null);
   
   useEffect(() => {
     const load = async () => {
       try {
         const res = await fetch('/api/content/metadata', { cache: 'no-store' });
         if (res.ok) {
           const json = await res.json();
           setFullContent(json);
         }
       } catch (e) {
         // ignore
       }
     };
     load();
   }, []);
   
   const typoConfig = useMemo(() => (fullContent ? getTypographyConfig(fullContent) : {}), [fullContent]);
   ```

2. **Utiliser pour chaque type de texte** :
   - **Titres principaux** : `h2` (via `getTypographyClasses('h2', ...)`, `getCustomColor('h2', ...)`, `getCustomLineHeight('h2', ...)`)
   - **Sous-titres** : `h3` (via `getTypographyClasses('h3', ...)`, `getCustomColor('h3', ...)`)
   - **Paragraphes/descriptions** : `p` (via `getTypographyClasses('p', ...)`, `getCustomColor('p', ...)`)
   - **Autres textes** : utiliser le niveau approprié (h2, h3, p, etc.)

3. **Exemple complet** :
   ```tsx
   import { getTypographyConfig, getTypographyClasses, getCustomColor, getCustomLineHeight, defaultTypography } from '@/utils/typography';
   
   const titleClasses = useMemo(() => {
     const safe = typoConfig?.h2 ? { h2: typoConfig.h2 } : {};
     const classes = getTypographyClasses('h2', safe, defaultTypography.h2);
     return classes
       .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
       .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
       .replace(/\btext-foreground\b/g, '')
       .replace(/\s+/g, ' ')
       .trim();
   }, [typoConfig]);
   
   const titleColor = useMemo(() => {
     const custom = getCustomColor('h2', typoConfig);
     return custom || 'var(--foreground)';
   }, [typoConfig]);
   
   const titleLineHeight = useMemo(() => getCustomLineHeight('h2', typoConfig) || undefined, [typoConfig]);
   
   // Utilisation
   <h2
     className={`mon-titre ${titleClasses}`}
     style={{ color: titleColor, ...(titleLineHeight && { lineHeight: titleLineHeight }) }}
   >
     {data.title}
   </h2>
   ```

4. **Règles importantes** :
   - ❌ **NE JAMAIS utiliser `<h1>` dans les blocs** (réservé au titre de page)
   - ✅ **Toujours utiliser les balises sémantiques** : `<h2>`, `<h3>`, `<p>`, etc.
   - ✅ **Tous les textes doivent passer par la config typographie** (pas de styles en dur)
   - ✅ **Nettoyer les classes de couleur** pour éviter les conflits avec la palette
   - ✅ **Utiliser `margin: 0`** sur les éléments typographiques pour éviter les marges par défaut

## Éditeur admin (`editor.tsx`)
- Mode compact activé et mode normal.
- Champs exposés :
  - Thème (`auto | light | dark`) via select shadcn.
  - Layout (`split | stacked`) via select shadcn.
  - Titre, sous-titre, description.
  - CTA texte + lien.
  - **Image principale** :
    - Utiliser `ImageThumbnail` ou `ImageEditorField` (composants réutilisables dans `src/blocks/auto-declared/components/`).
    - **Thumbnail cliquable** : clic sur l'image ouvre un dropdown avec :
      - "Remplacer" : ouvre le sélecteur de fichier pour uploader une nouvelle image.
      - "Supprimer" : supprime l'image.
    - **Ratio d'aspect** : utiliser `AspectRatioSelect` avec les valeurs disponibles (auto, 1:1, 2:3, 3:4, 4:5, 9:16, 3:2, 4:3, 5:4, 16:9, 2:1, 4:1, 8:1).
    - **Alt text** : champ texte pour la description de l'image.
    - Icônes œil/poubelle en w-3 h-3 pour visibilité/suppression (si applicable).
    - Aucun badge de ratio en front/preview.
  - Option booléenne : switch shadcn (exemple “Option toggle”) pour gérer un flag.
  - Sélecteur de page (destination) dans les notes détaillées : dropdown alimenté par `/api/admin/content` (pages Accueil/Work/Studio/Blog/Contact + pages dynamiques).
  - CTA : texte + lien via dropdown de pages (même source que “Page de destination”) avec option URL personnalisée. Utiliser `TransitionLink` pour bénéficier des transitions de page sur les liens internes.
  - **Notes détaillées** (variant "testimonial") :
    - Bouton unique `Add images` (upload multi) → crée des notes avec thumbnails.
    - Drag & drop via handle.
    - Bloc fermé par défaut ; chevron pour ouvrir.
    - **Header avec image** :
      - **Thumbnail cliquable avec dropdown** : utiliser `DropdownMenu` de shadcn/ui directement (pas `ImageThumbnail` dans le header) :
        ```tsx
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className="w-8 h-8 border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 overflow-hidden cursor-pointer hover:border-blue-400 transition-colors relative"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {image?.src ? (
                <div
                  className="absolute inset-0 w-full h-full bg-center bg-cover"
                  style={{ backgroundImage: `url(${image.src})` }}
                />
              ) : (
                <ImagePlus className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44 shadow-none border rounded">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <ImagePlus className="w-3 h-3 mr-2" />
              Remplacer
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onRemoveImage();
              }}
              className="text-[13px] text-red-600"
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          onClick={(e) => e.stopPropagation()}
        />
        ```
      - **Important** : Toujours utiliser `e.stopPropagation()` sur les événements du dropdown pour éviter que le clic n'ouvre/ferme l'accordéon parent.
      - Ratio select complet : utiliser `AspectRatioSelect` avec `stopPropagation={true}` et wrapper dans un div avec `onClick={(e) => e.stopPropagation()}`.
      - Icônes œil/poubelle harmonisées (w-3 h-3) pour visibilité/suppression.
    - Accordéon : titre (texte), alt (texte — alimente aussi l'alt de l'image), résumé (textarea), contenu (WYSIWYG).
- Tous les dropdowns/selects utilisent les composants shadcn (`@/components/ui/select`).
- Pas de fallback : la liste démarre vide.
- Compatibilité scroll animations : si le bloc est “pinned”, appliquer l’animation fade spéciale (cf. page admin `http://localhost:3000/admin?page=scroll-animations`). Centraliser ce comportement ici pour éviter les bugs de combinaison pin + scroll animation.
  - Détails scroll animations (cf. `docs/SCROLL-ANIMATIONS.md`) :
    - Config globale dans l’admin “Animations Scroll” (type, durée, délai, easing, threshold, stagger).
    - Sur blocs pin (pinned), forcer l’animation fade spéciale pour éviter les glitchs pin + animation.
    - Respecter la préférence `prefers-reduced-motion` si activée.
    - Pour les listes, utiliser le stagger (ou delay indexé) via `ScrollAnimated`/`useScrollAnimation`.
    - Les configs sont lues depuis `content.metadata.scrollAnimations` (global + overrides par type).
- Transitions de page (cf. `docs/TRANSITIONS-SYSTEM.md` et admin `http://localhost:3000/admin?page=metadata`) :
  - Récupérer la config via `getTransitionConfig` (`src/utils/transitionConfig.ts`) qui unifie `content._transitionConfig` et `content.metadata._transitionConfig`.
  - Lorsqu’un lien de page (sélecteur de destination) est utilisé, respecter la transition active (navigation animée) ; fallback en navigation classique si désactivée.
  - Si une transition est spécifique au type de bloc, la documenter dans ce bloc et la lire depuis `metadata` (pas de valeurs en dur).

## Styles (`styles.css`)
- Conteneur avec fond, bordure, shadow léger.
- Variantes light/dark via `data-block-theme`.
- Layout split responsive (grid) ou stacked.
- Styles CTA et image.
- **Images** : utiliser `aspect-ratio` CSS avec la valeur du ratio sélectionné (ex: `aspect-ratio: 16/9` pour "16:9").

## Bonnes pratiques appliquées
- Paramètre `compact?: boolean` respecté (cf. `docs/COMPACT-MODE-EDITOR.md`).
- Types explicités dans l'éditeur et le composant.
- **Upload image** : réutilise l'API `/api/admin/upload`.
- **Composants image réutilisables** :
  - `ImageThumbnail` : miniature avec dropdown (Remplacer/Supprimer) — **à utiliser dans les accordéons ou champs isolés**.
  - `ImageEditorField` : champ complet (thumbnail + alt + ratio) — **à utiliser dans les formulaires simples**.
  - `AspectRatioSelect` : sélecteur de ratio d'aspect.
  - **Dans les headers de blocs sortables** : utiliser `DropdownMenu` directement (pas `ImageThumbnail`) pour éviter les conflits avec le toggle de l'accordéon (voir exemple dans la section "Notes détaillées").
- **Clic sur image** : ouvre dropdown avec "Remplacer" et "Supprimer".
  - **Dans header sortable** : utiliser `DropdownMenu` avec `e.stopPropagation()` sur tous les événements (`onClick`, `onPointerDown`).
  - **Dans accordéon/champ isolé** : utiliser `ImageThumbnail` avec `stopPropagation={true}`.
- **Ratio d'aspect** : toujours exposer via `AspectRatioSelect` pour toutes les images, avec `stopPropagation={true}` dans les headers.
- **Gestion des événements dans headers sortables** :
  - Toujours utiliser `onClick={(e) => e.stopPropagation()}` et `onPointerDown={(e) => e.stopPropagation()}` sur les éléments interactifs (dropdowns, selects) pour éviter que le clic n'ouvre/ferme l'accordéon.
- Ids stables pour les détails (`id` obligatoire, généré à l'ajout).
- Fallback data dans l'éditeur pour éviter un écran vide.

## Comment tester
1. Lancer l’admin : `http://localhost:3000/admin/preview`.
2. Ajouter le bloc `template-guidelines`.
3. Vérifier :
   - Titre/sous-titre/description/CTA modifiables.
   - Image principale : upload ou URL + alt + ratio (œil/poubelle visibles).
   - Notes détaillées : upload multi via `Add images`, thumbnails visibles, drag & drop, œil/poubelle cohérents, ratio select, accordéon fermé par défaut puis champs (titre, alt, résumé, WYSIWYG).
   - Switch thème + select layout (front change).
   - Mode compact : mêmes champs en version réduite.

## Usage attendu
- Servir de référence quand on crée un nouveau bloc : reprendre la structure de l’éditeur (compact/non-compact), les champs exposés, le fallback des données et l’usage systématique des selects shadcn.
