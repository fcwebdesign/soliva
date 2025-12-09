## Soliva — Synthèse des décisions et priorités

### Migration (WP → Soliva)
- Features à reprendre : espace client (adhésion, rôles pré-adherent/adhérent/comptable), upload pièces (kbis/liasse/contrat/rib), validation admin, cotisations, mails Brevo, contenus/blocks.
- Nouveau stockage : BDD (Postgres) + storage privé (S3/R2) pour les fichiers (noms randomisés, liens signés). Plus de `public/uploads` ni de `content.json` pour persister.
- Auth/ACL : sessions ou JWT httpOnly, middleware sur toutes les routes `api/admin/*`, rôles admin/éditeur/client, rate limit login/upload, CORS strict, CSRF si cookies.
- Validation : schémas Zod sur payloads (content, templates, uploads), refuser champs inattendus, statuts draft/published/schedule, versions/rollback.
- Logs : journal des actions (écriture contenu, upload, validation pièces), erreurs mails/API.

### Schéma BDD minimal (Postgres + Prisma)
- users(id, email, password hash, role, status, createdAt).
- content(id, type, slug, data JSON, status draft/published, publishedAt, createdAt, updatedAt).
- content_versions(id, contentId, data JSON, createdAt, createdBy).
- media(id, userId, fileKey, mime, size, createdAt).
- logs(id, userId, action, payload JSON, createdAt).
- (Optionnel selon besoin client) contacts, cotisations, user_cotisations, documents (type/statut/validation).

### Sécurité à mettre en place rapidement
- Auth/ACL obligatoire sur admin, rate limiting, CORS strict.
- Uploads : storage privé, whitelist type/taille, pas de SVG ou SVG sanitizés, pas d’URL publiques.
- Headers : HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options.
- Tests d’intégration sur routes sensibles (auth, upload, write content).

### Media/Files
- Storage privé (S3/R2/Minio), noms randomisés, liens signés pour download, métadonnées en BDD.
- Media library : alt/légende, tailles éventuelles, dédup/limites plan.

### Templates/Blocks
- Tokens (couleurs/typo/spacing/motions) centralisés par template.
- Schéma de blocks validé (Zod) + migrations en cas d’évolution.
- Presets SEO/OG par template, preview snippet.
- Guide duplication template : tokens + layout + schéma contenu + defaults SEO.

### SaaS / Abonnements
- Paiement (Stripe ou autre) : sous-domaine auto `client.soliva.app` à la création.
- Multi-tenant : `tenant_id` dans les tables ou instances isolées (plus tard).
- Domaines : par défaut sous-domaine inclus ; option “connecter mon domaine” via CNAME + SSL auto. Pas de revente obligatoire.
- Si besoin d’affiliation : proposer 2–3 registrars (ex. Namecheap/GoDaddy) et recommander Cloudflare Registrar pour l’expérience (pas de com).
- Quotas par plan : pages, volume média, utilisateurs, espace disque. Statut plan via webhooks de paiement.

### Priorités avant nouveaux blocs/UI
1) BDD et branchement Prisma (remplacer `content.json`).
2) Auth/ACL + rate limit sur `api/admin/*`.
3) Upload vers storage privé + Media table.
4) Validation schémas + versions/rollback + statuts draft/published.
5) Logs/changelog et confirmations sur actions destructrices.

