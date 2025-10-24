# Guide Template Starter — Créer et personnaliser un template

Ce document décrit comment s’appuyer sur le template « starter » comme référence pour créer et customiser des templates dans ce projet.

## Objectifs
- Un Shell unique par template (Header + Footer + styles).
- Rendu des pages (home, work, work/[slug], blog, blog/[slug], studio, contact, pages custom) à partir du contenu JSON.
- Overrides de blocs par template (ex. Services différent selon le template).
- Preview simple via `?template=<key>` (cookie preview à venir si souhaité).

---

## Architecture minimale d’un template

- Dossier: `src/templates/<key>/`
  - `StarterApp.tsx` (point d’entrée client du template) ou un ensemble de pages client si vous préférez.
  - `blocks/` (overrides optionnels de blocs, ex. `Services.tsx`).
  - `styles.css` (tokens/styles spécifiques au template) — optionnel mais recommandé.
- Déclaration: `src/templates/registry.ts`
  - Ajoutez une entrée au registre des templates.
- Rendu: `src/templates/TemplateRenderer.tsx`
  - Ajoutez un `case '<key>'` qui retourne votre App/Shell du template.
- Overrides de blocs: `src/blocks/registry.ts`
  - Mappez les types de blocs que vous voulez surcharger pour ce template.
- Seed (optionnel): `data/templates/<key>.json`
  - Sert à lister le template dans l’admin et à fournir un contenu de démo.

Exemple (starter déjà en place):
- `src/templates/starter/StarterApp.tsx` — Shell + routing client
- `src/templates/starter/blocks/Services.tsx` — override du bloc Services
- `src/templates/registry.ts` — ajoute `starter`
- `src/templates/TemplateRenderer.tsx` — case `starter` qui retourne `<StarterApp />`
- `src/blocks/registry.ts` — map `services` → `ServicesStarter` pour `starter`
- `data/templates/starter.json` — seed de démo

---

## Preview et Apply

- Preview (actuel): ajoutez `?template=<key>` à l’URL, ex. `/?template=starter`.
  - La navigation côté template conserve ce paramètre automatiquement.
- Apply (non destructif): via l’admin Templates → « Appliquer ».
  - Met `content._template = '<key>'` sans écraser le contenu client.
  - « Reset depuis seed » (destructif) doit être une action à part (avec backups et confirmation).

Astuce: pour ne pas affecter l’admin, aucune application de template n’est faite sur les routes `/admin`.

---

## Shell du template

Le Shell contient:
- Header: logo, nav dynamiques depuis `content.nav` (items, labels, customUrl/target)
- Footer: textes/links/socials depuis `content.footer`
- Styles: classes utilitaires + variables CSS (tokens) propres au template
- Conteneur pour le « body » de chaque route

Extrait (simplifié):
```tsx
function StarterShell({ content, children }: { content: any; children: React.ReactNode }) {
  const items = content?.nav?.items?.length ? content.nav.items : ['home','work','studio','blog','contact'];
  const labelFor = (key: string) => {
    const entry = content?.nav?.pageLabels?.[key];
    return typeof entry === 'string' ? entry : entry?.title || key;
  };
  const urlFor = (key: string) => (key === 'home' ? '/' : `/${key}`);

  return (
    <div className="template-starter">
      <header>/* nav basée sur items */</header>
      <main>{children}</main>
      <footer>/* content.footer */</footer>
    </div>
  );
}
```

---

## Rendu des blocs (BlockRenderer)

Utilisez le BlockRenderer « registry »: `import BlockRenderer from '@/blocks/BlockRenderer'`.

Ce renderer:
1) tente d’abord un override de bloc pour le template courant (défini dans `src/blocks/registry.ts`),
2) sinon retombe vers les blocs auto‑déclarés (système scalable),
3) applique des attributs `data-block-type` et `data-block-theme` pour le système de thème.

Cela garantit que:
- Un bloc de type `services` utilise la version spécifique du template si elle existe,
- Et sinon le rendu scalable par défaut.

---

## Override d’un bloc (ex: Services)

- Créez `src/templates/<key>/blocks/Services.tsx` pour votre template.
- Déclarez‑le dans `src/blocks/registry.ts`:
```ts
import ServicesStarter from '../templates/starter/blocks/Services';

export const registries = {
  default: defaultRegistry,
  starter: {
    ...defaultRegistry,
    services: ServicesStarter as BlockComponent,
  },
};
```
- Exemple minimal du composant:
```tsx
export default function ServicesBlockTemplate({ title, subtitle, offerings = [], layout, columns }) {
  const items = offerings || [];
  const cols = columns ?? (layout === 'grid-4' ? 4 : layout === 'grid-2' ? 2 : 3);
  return (
    <section data-block-type="services">
      {title && <h2>{title}</h2>}
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap:24 }}>
        {items.map((it, i) => (
          <article key={i}>
            {it.title && <h3>{it.title}</h3>}
            {it.description && <div dangerouslySetInnerHTML={{ __html: it.description }} />}
          </article>
        ))}
      </div>
    </section>
  );
}
```

Notes:
- Le override accepte les props à plat (pas `data:{...}`) — le BlockRenderer passe déjà les propriétés à plat.
- Si un `services` est inclus dans un bloc « Deux colonnes », il sera quand même rendu via l’override car le TwoColumnsBlock tente d’abord un override de template.

---

## Styles & Typo par template

- Définissez des variables CSS dans `src/templates/<key>/styles.css`, scopez par `html[data-template="<key>"]`.
- Importez des fonts via `next/font` et exposez‑les en variables CSS (ex: `--font-sans`, `--font-display`).
- Utilisez ces variables dans les composants du template.

Exemple:
```css
html[data-template="starter"] {
  --font-sans: ui-sans-serif, system-ui, Inter, "Helvetica Neue", Arial, sans-serif;
  --fg: 17 17 17; /* text */
  --bg: 255 255 255; /* background */
}
.template-starter .title { font-family: var(--font-sans); }
```

---

## Navigation dynamique (labels/URLs)

- Les items viennent de `content.nav.items` (fallback: `['home','work','studio','blog','contact']`).
- Les labels/URLs/targets sont dans `content.nav.pageLabels[key]`:
  - string → label simple
  - object → `{ title, customUrl, target }`
- Adaptez la nav du Shell avec un petit adapter pour gérer liens externes.

---

## Admin & Templates

- L’admin liste les templates depuis `data/templates/*.json` (seed). Ajoutez un 
  fichier JSON pour faire apparaître votre template.
- L’admin affiche « Template actuel » via `content._template`.
- Preview: bouton « Aperçu » → `/?template=<key>`
- Appliquer: bouton « Appliquer » → set `_template` (non destructif).

---

## Dépannage rapide

- Vous voyez uniquement « Nos réalisations » sur la home:
  - Assurez‑vous d’utiliser `import BlockRenderer from '@/blocks/BlockRenderer'` (et pas `@/components/BlockRenderer`).
  - Assurez‑vous que `home.blocks` contient bien des blocs (ex. `services`, `two-columns`).
  - Hard reload (Cmd+Shift+R) pour recharger les chunks.
- Un sous‑bloc `services` dans « Deux colonnes » n’usa pas l’override:
  - `TwoColumnsBlock` a été ajusté pour tenter l’override du template avant le fallback scalable.
- L’admin ne doit pas afficher le template:
  - Les routes `/admin` ne reçoivent pas de rendu template (détecté dans le layout).

---

## Étapes type pour créer un nouveau template basé sur starter

1) Copier `src/templates/starter/` → `src/templates/<nouveau>/` et renommer le composant d’entrée.
2) Ajouter `<nouveau>` dans `src/templates/registry.ts` (autonomous: true).
3) Ajouter `case '<nouveau>'` dans `src/templates/TemplateRenderer.tsx` qui retourne votre App/Shell.
4) Ajouter `data/templates/<nouveau>.json` (seed) pour lister dans l’admin.
5) (Optionnel) Ajouter des overrides de blocs dans `src/templates/<nouveau>/blocks/` et les mapper dans `src/blocks/registry.ts`.
6) Styles/typo: tokens dans `src/templates/<nouveau>/styles.css`.
7) Tester en preview: `/?template=<nouveau>`.

---

## Aller plus loin (roadmap possible)
- Cookie de preview (évite le `?template=` à propager).
- Manifest par template (déclare meta, routes, navAdapter, overrides), et TemplateRenderer générique.
- Template settings persistés dans `content._templateSettings[<key>]` (couleurs, fontes, radius, etc.).

