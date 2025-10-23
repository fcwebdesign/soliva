# Système de Templates — Guide Dev & Agent

Ce document explique le système de templates actuel, comment en créer/activer un, et fournit un protocole précis pour un « template agent » (automatisation).

## Objectifs

- Séparer style/structure du contenu métier (JSON).
- Activer un template par URL (`?template=...`) ou par config persistée (`content._template`).
- Permettre des templates « autonomes » (gèrent header/footer/rendu) ou « shell par défaut » (réutilisent la nav/footer globales + styles).

## Architecture (état actuel)

- Code templates: `src/templates/`
  - `registry.ts` — liste des templates disponibles et méta (clé, nom, autonomous).
  - `get-active-template.ts` — résout le template actif en fonction des headers/params contenu.
  - `context.tsx` — `TemplateProvider` met la clé de template dans le contexte.
  - `TemplateRenderer.tsx` — rend la bonne vue selon le template + la route active.
  - `minimaliste-premium/` — exemple complet (clients pages, layout, styles).
- Activation globale: `src/app/layout.tsx`
  - Lit `getActiveTemplate()`, place `data-template="<key>"` sur `<html>` et encapsule avec `TemplateProvider`.
- Middleware: `src/middleware.ts`
  - Ajoute des headers (`x-pathname`, `x-search-params`) pour que les Server Components sachent quelle route est demandée.
- Seeds de templates: `data/templates/*.json`
  - Contenu type pour chaque template, appliqué via API.
- Application d’un template: `src/app/api/admin/templates/apply/route.ts`
  - Reçoit `{ templateId }`, lit le seed, sauvegarde des backups, fusionne intelligemment avec `data/content.json`, puis persiste `_template`.

## Activation d’un template

Priorité et règles (voir `src/templates/get-active-template.ts`):

1. `?template=<key>` → priorité absolue (même en mode preview), appliqué sur toutes les pages (hors admin/debug/apply-template).
2. `?preview=...` sans `template` → ne pas appliquer de template (prévisualisation du contenu seulement).
3. `data/content.json` → si `_template` défini et présent dans `TEMPLATES`, l’appliquer.

Routes admin et techniques (`/admin`, `/debug-template`, `/apply-template`) ne déclenchent pas l’application.

## Deux modes de templates

- Autonomous (`autonomous: true`):
  - Le template gère entièrement le rendu par page. Implémentation dans `TemplateRenderer` (switch par `key` + `pathname`).
  - Exemple: `minimaliste-premium` avec des composants clients dédiés pour `/`, `/studio`, `/work`, `/contact`, `/blog`.

- Non-autonomous (`autonomous: false`):
  - Le shell global (Nav/Footer) est conservé. Le template influe via classes utilitaires (`template-<key>`) et, au besoin, des overrides ciblés de blocs.

## Créer un nouveau template (manuel)

1) Définir la méta dans le registre

Fichier: `src/templates/registry.ts`

```ts
export const TEMPLATES = {
  'minimaliste-premium': { key: 'minimaliste-premium', autonomous: true, name: 'Minimaliste Premium' },
  'ma-signature': { key: 'ma-signature', autonomous: false, name: 'Ma Signature' },
  // ...
};
```

2) Ajouter le rendu dans `TemplateRenderer`

Fichier: `src/templates/TemplateRenderer.tsx`

- Autonomous: ajouter un `case 'ma-signature':` qui retourne le bon composant par `pathname`.
- Non-autonomous: pas d’obligation — le shell par défaut s’applique.

3) Créer le dossier du template

```
src/templates/ma-signature/
  theme.css                  # tokens css (optionnel)
  home-client.tsx            # si autonomous
  studio-client.tsx          # si autonomous
  ...
  blocks/                    # overrides optionnels de blocs
```

4) Fournir un seed de contenu

Créer `data/templates/ma-signature.json` avec les sections désirées (`nav`, `home`, `work`, `studio`, `blog`, `contact`, `footer`, etc.).

5) Tester

- Preview rapide: `http://localhost:3000/?template=ma-signature`
- Application persistée (curl):

```bash
curl -X POST http://localhost:3000/api/admin/templates/apply \
  -H 'Content-Type: application/json' \
  -d '{"templateId":"ma-signature"}'
```

Vérifier `data/content.json` → champ `"_template": "ma-signature"` et backups dans `data/backups/`.

## Overrides de blocs (optionnel)

- Par défaut, les blocs auto-déclarés existent et peuvent être stylés via `.template-<key> .block-...` (`UniversalBlockRenderer` applique déjà des classes par template).
- Si un template a besoin d’un rendu spécifique pour un type de bloc, créer `src/templates/<key>/blocks/<Type>.tsx` et câbler l’override via un registre spécifique (ex: voir `src/blocks/registry.ts` qui mappe quelques blocs pour `minimaliste-premium`).

## Bonnes pratiques

- Garder les seeds minimalistes: n’ajouter que les sections nécessaires; préserver la fusion de projets existants (déjà gérée pour `minimaliste-premium`).
- Ne pas logger en prod (bruit/latence). Utiliser `?template=` pour preview; éviter l’accès FS depuis le middleware.
- Préfixer tous les styles template par `.template-<key>`.

## API et endpoints utiles

- `POST /api/admin/templates/apply` — applique un template depuis `data/templates/<key>.json` (sauvegardes automatiques dans `data/backups/`).
- Pages publiques avec preview: `/?template=<key>&preview=1` (le template n’est pas appliqué si seul `preview` est présent — règle volontaire).

## Check-list de test

- `layout` rend `<html data-template="<key>">` (voir `src/app/layout.tsx`).
- `?template=<key>` applique le template sur toutes les pages (hors admin).
- Application persistée → `data/content.json` contient `"_template": "<key>"`.
- Backups présents dans `data/backups/`.
- Aucun effet sur `/admin` et sur les routes d’API protégées.

---

## Guide « Template Agent »

L’agent doit pouvoir créer, documenter, appliquer et vérifier des templates de bout en bout.

### Capacités minimales

- Lister les templates installés en lisant:
  - `src/templates/registry.ts` (clés) et `data/templates/*.json` (seeds disponibles).
- Créer un template « non-autonomous » en 3 fichiers:
  1. Entrée `TEMPLATES` dans `src/templates/registry.ts` (clé + nom + `autonomous: false`).
  2. `src/templates/<key>/theme.css` avec tokens de style.
  3. `data/templates/<key>.json` (seed minimal).
- Créer un template « autonomous »:
  1. Entrée `TEMPLATES` (clé + nom + `autonomous: true`).
  2. Clients pages (`home-client.tsx`, …) + `TemplateRenderer` mis à jour (nouveau `case`).
  3. Seed JSON.
- Appliquer un template via `POST /api/admin/templates/apply` et vérifier:
  - `_template` dans `data/content.json`, backups créer, rendu effectif sans erreur.

### Tâches type (scripts/automatisation)

- `scaffold:template <key> [--autonomous]`
  - Crée le dossier `src/templates/<key>/` + seed `data/templates/<key>.json` + patch dans `registry.ts` et (si autonomous) dans `TemplateRenderer`.
- `apply:template <key>`
  - Appelle l’API d’application + affiche le diff de `data/content.json`.
- `verify:template <key>`
  - Ouvre `/?template=<key>` et vérifie `data-template` dans le HTML, présence des classes `.template-<key>` et absence d’erreurs serveur.

### Conventions de code (agent)

- Respecter la structure existante, patchs minimaux et ciblés.
- Ne pas surcharger `TemplateRenderer`: un `case` par template autonome; privilégier composants/petites fonctions.
- Toujours créer/mettre à jour un seed; ne jamais écraser des projets existants sans backup.

---

## Roadmap (évolution suggérée)

Ces éléments ne sont pas encore en place mais sont recommandés pour la scalabilité:

- Manifest par template (`manifest.ts`) exposant meta, routes, settingsSchema (zod), overrides → génération d’un `registry.gen.ts` au build.
- Page Admin « Galerie de templates » (`/admin/templates`) avec preview/apply/settings.
- Réglages par template persistés dans `content._templateSettings[<key>]` (formulaire auto-généré).
- Résolution générique des overrides de blocs: `getBlockComponent(type, templateKey)`.
- Migrations versionnées (`manifest.version` + `migrations[]`).

---

## Références de fichiers

- `src/templates/registry.ts`
- `src/templates/get-active-template.ts`
- `src/templates/TemplateRenderer.tsx`
- `src/app/layout.tsx`
- `src/middleware.ts`
- `data/templates/*.json`
- `src/blocks/registry.ts` (exemples d’overrides)

