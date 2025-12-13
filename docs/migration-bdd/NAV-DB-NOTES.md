# Notes DB – Navigation

## Environnement / modes
- `CONTENT_MODE` : `json` (legacy), `dual_write` (écrit DB + fichiers), `db` (full DB).  
  Préférer `dual_write` le temps de valider, puis passer en `db`.
- `DATABASE_URL` : Postgres (Supabase).

## Mapping DB
- `Site`
  - `metadata.nav` (JSON) : `{ logo, logoImage, location, headerVariant, pageLabels }`
  - Autres JSON : `typography`, `spacing`, `palettes`, `transitions`.
- `NavigationItem`
  - Champs : `siteId`, `label`, `url`, `orderIndex`, `isExternal`.
- `Footer`, `Page`, `Article`, `Project` existent déjà (voir ETAT-ACTUEL-MIGRATION).

## API / flux
- GET `/api/admin/content?site=<template>`
  - Reconstruit le contenu depuis la DB : nav (items + identité), footer, pages core + custom, articles, projets.
- PUT `/api/admin/content?site=<template>`
  - Upsert complet en base (et écriture fichier si `dual_write`).
  - Persiste `metadata.nav` (logo, labels, etc.) et `NavigationItem` (ordre, isExternal).

## Admin / template
- L’admin conserve `?template=` (stocké aussi en localStorage) pour rester sur le bon site.
- Écrans nav/pages/projets utilisent `/api/admin/content?site=<template>`.
- Nav : l’écran sauvegarde vers DB via l’API ; items = `NavigationItem`, identité = `Site.metadata.nav`.

## Garde-fous / règles
- `work.filters` forcé en tableau si absent (évite l’erreur Zod).
- En `dual_write`, la lecture passe par la DB (fallback JSON si échec).
- Lors de la construction nav :
  - `isExternal` détecté par URL http/https.
  - Les labels proviennent de `pageLabels` ; sinon on dérive du slug.

## Vérifications rapides
- Prisma Studio :
  - `NavigationItem` pour les entrées de menu.
  - `Site.metadata.nav` pour logo/labels.
- API : `GET /api/admin/content?site=<template>` doit retourner `nav.items` + `nav.pageLabels`.
