# Notes DB – Footer

## Mapping DB
- Table `Footer`
  - `siteId` (unique par site/template)
  - `content` (string/HTML)
  - `socials` (JSON array)
  - `columns` (JSON array)
- Table `Site`
  - Pas de champ footer dans metadata : le footer vit dans la table dédiée.

## API / flux
- GET `/api/admin/content?site=<template>` : retourne le footer depuis la DB (`Footer`), ou `undefined` si absent.
- PUT `/api/admin/content?site=<template>` : `upsert` le footer dans la table `Footer` (content, socials, columns).
- En modes `dual_write` / `db`, la lecture passe par la DB (fallback JSON si échec). En `json`, comportement legacy (fichier).

## Admin
- L’admin garde `?template=` pour cibler le bon site (mémorisé en localStorage).
- La page Footer sauvegarde via `/api/admin/content?site=<template>`, en utilisant les données collectées par le composant footer (logo/texte/colonnes/socials).

## Vérifications
- Prisma Studio : table `Footer` pour vérifier content/socials/columns.
- API : `GET /api/admin/content?site=<template>` doit renvoyer la clé `footer` (objet) si présent.
