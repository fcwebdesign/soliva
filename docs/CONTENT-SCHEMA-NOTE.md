# Note: schema unique pour le contenu et les blocs

Objectif: une seule source de verite pour la forme du contenu (pages + blocs), reutilisable pour les types TypeScript, la validation runtime et l’UI d’admin. Moins de drift entre `data/content.json`, `Content` et les registres de blocs.

## Cible proposee
- Fichier central `src/lib/content-schema.ts` qui decrit le schema du contenu.
- Type derive `Content` (utilise partout) et validateur runtime (utilise dans `readContent()`).
- Schema expose a l’admin pour generer les champs et eviter le formulaire manuel.
- Registre de blocs auto-declare: chaque bloc porte ses metadonnees (type, label, fields). Le type `BlockType` et la forme des `blocks` sont deduits du registre, plus de union maintenue a la main.

## Option A (sans dependance externe)
Pseudo API maison:
```ts
// src/lib/content-schema.ts
import { defineSchema, infer, createValidator } from './schema-core'; // a ecrire

export const contentSchema = defineSchema({
  metadata: { title: 'string', description: 'string', layout: ['compact', 'standard', 'wide'] },
  nav: {
    logo: 'string',
    items: ['string'],
    location: 'string',
  },
  // ... home, contact, studio, work, blog, footer, etc.
});

export type Content = infer<typeof contentSchema>;
export const validateContent = createValidator(contentSchema);
```
- `defineSchema` retourne un objet `as const` lisible.
- `infer` transforme ce schema en type TS (mecanique generique).
- `createValidator` checke le JSON runtime (types primitifs, enums, tableaux).
- `readContent()`: lire le JSON, `validateContent(json)`, log clair si erreur.
- `src/types/content.ts` peut juste `export type Content = infer<typeof contentSchema>;`.

## Option B (avec zod si on accepte la dependance)
```ts
// src/lib/content-schema.ts
import { z } from 'zod';

export const contentSchema = z.object({
  metadata: z.object({
    title: z.string(),
    description: z.string(),
    layout: z.enum(['compact', 'standard', 'wide']).optional(),
  }),
  nav: z.object({
    logo: z.string(),
    items: z.array(z.string()),
    location: z.string(),
  }),
  // ... home, contact, studio, work, blog, footer, etc.
});

export type Content = z.infer<typeof contentSchema>;
export const validateContent = (input: unknown) => contentSchema.parse(input);
```
- `readContent()` appelle `validateContent`.
- Types auto derives, pas de double source.

## Blocs (a faire avec le registre auto-declared)
- Introduire `registerBlock({ type, label, fields, component, createDefault })` qui enregistre:
  - `metadata` (label, description, category, icone) pour l’admin.
  - `fields` (type text, textarea, image, select, color, toggle, array, etc.) pour generer l’UI.
- Generer `BlockType` et `BlockData` depuis ce registre (plus de union manuel dans `src/blocks/types.ts`).
- Le renderer et l’editor parcourent le registre; ajout d’un bloc = ajouter un fichier + 1 import dans l’index.

## Plan d’implementation (phases rapides)
1) Creer `src/lib/content-schema.ts` (Option A ou B). Couvrir les champs actuels (metadata, nav, home, contact, studio, work, blog, footer, _template...).  
2) Remplacer `src/types/content.ts` par un re-export du type derive du schema.  
3) Brancher `readContent()` sur `validateContent` (message d’erreur propre, pas d’ecriture).  
4) Exposer le schema a l’admin (plus tard) pour generer les champs du formulaire au lieu de les coder a la main.  
5) Pour les blocs: formaliser `registerBlock` et deduire les types du registre auto-declare; supprimer les `any` et unions manuelles.

## Notes
- Le seed JSON doit toujours etre conforme au schema; ajouter un test unitaire simple `readContent()` avec `data/content.json` pour eviter les regressions.
- Tout reste lecture seule tant que l’admin n’ecrit pas; la validation runtime evite les surprises quand on activera l’ecriture. 
