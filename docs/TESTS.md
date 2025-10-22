# Tests unitaires — Guide rapide (Vitest)

Ce guide explique comment installer, lancer et écrire des tests unitaires pour les hooks, les blocs auto‑déclarés et les routes API du projet.

---

## 1) Installation & commandes

- Installer les dépendances

```bash
npm install
```

- Lancer tous les tests (une fois)

```bash
npm run test
```

- Mode watch pour développer les tests

```bash
npm run test:watch
```

Fichiers utiles:
- Config Vitest: `vitest.config.ts`
- Scripts NPM: `package.json`

---

## 2) Organisation des tests

- Les tests sont placés dans `__tests__/` (ex: `__tests__/hooks/...`, `__tests__/api/...`, `__tests__/blocks/...`).
- Les chemins d’import utilisent l’alias `@` qui pointe vers `src` (géré dans `vitest.config.ts`).
- Environnement par défaut: `jsdom` (adapté pour React). Pour les tests Node (routes API), ajouter en tête de fichier:

```ts
/* @vitest-environment node */
```

Exemples existants:
- Hooks: `__tests__/hooks/useAIAssistant.test.tsx`, `__tests__/hooks/useConfirmDialog.test.tsx`, `__tests__/hooks/useTheme.test.tsx`
- Blocs (registry): `__tests__/blocks/auto-declared.test.ts`
- API: `__tests__/api/content.test.ts`, `__tests__/api/versions.test.ts`, `__tests__/api/upload.test.ts`, `__tests__/api/preview-create.test.ts`

---

## 3) Tester un hook React

Pattern recommandé avec Testing Library:

```tsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { useAIAssistant } from '@/app/admin/components/hooks/useAIAssistant';

describe('useAIAssistant', () => {
  it('met à jour la description via l’API', async () => {
    // Mock global fetch
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ suggestedDescription: 'Texte IA' }),
    }) as any);

    const updateField = vi.fn();

    const { result } = renderHook(() =>
      useAIAssistant({ pageKey: 'contact', localData: {}, blocks: [], updateField, updateBlock: vi.fn() })
    );

    await act(async () => {
      await result.current.getDescriptionSuggestion();
    });

    expect(updateField).toHaveBeenCalledWith('description', 'Texte IA');
  });
});
```

Astuce:
- Mocker les libs externes (ex: `sonner`) via `vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))`.

---

## 4) Tester une route API Next

Point clé: importer la route après avoir mocké ses dépendances (I/O, lib de contenu), et utiliser l’environnement Node.

En‑tête:
```ts
/* @vitest-environment node */
```

Mock + import dynamique:
```ts
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/content', () => ({
  readContent: vi.fn(),
  writeContent: vi.fn(),
}));

const importRoute = async () => await import('@/app/api/admin/content/route');

it('PUT écrit et renvoie le contenu', async () => {
  const { PUT } = await importRoute();

  // Faux request minimal
  const req: any = { json: async () => ({ content: { nav: { items: ['home'] } } }) };

  const res = await PUT(req);
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data).toBeDefined();
});
```

I/O fichier (upload/preview):
- Mocker `fs.promises` pour éviter d’écrire sur le disque:

```ts
vi.mock('node:fs', async (orig) => {
  const mod: any = await (orig as any)();
  return {
    ...mod,
    promises: {
      ...mod.promises,
      mkdir: vi.fn().mockResolvedValue(undefined),
      writeFile: vi.fn().mockResolvedValue(undefined),
    },
  };
});
```

---

## 5) Tester le registre des blocs auto‑déclarés

Les blocs s’enregistrent par side‑effect. Importer l’index des blocs, puis interroger le registre:

```ts
import '@/blocks/auto-declared';
import { getAvailableBlockTypes, getAutoDeclaredBlock, createAutoBlockInstance } from '@/blocks/auto-declared/registry';

it('enregistre les types connus', () => {
  const types = getAvailableBlockTypes();
  expect(types).toContain('content');
});

it('crée une instance par défaut', () => {
  const inst = createAutoBlockInstance('content');
  expect(inst).toMatchObject({ type: 'content', data: { content: '' } });
});
```

Pour tester le rendu d’un bloc React, utiliser `@testing-library/react` et rendre directement son `component` exporté du registre.

---

## 6) Environnements, mocks & astuces

- Environnement jsdom (par défaut): idéal pour hooks/React.
- Environnement node: nécessaire pour les routes API.
- `fetch` global: `vi.stubGlobal('fetch', fn)`.
- `console` trop bavard: `vi.spyOn(console, 'error').mockImplementation(() => {})` pendant le test.
- Imports Next:
  - Les handlers `GET/POST/PUT` n’ont pas besoin d’un serveur — ce sont des fonctions pures.
  - Si besoin, vous pouvez mocker `next/headers`/`next/server`.

---

## 7) Filtrer et déboguer

- Lancer un seul fichier: `npx vitest run __tests__/hooks/useAIAssistant.test.tsx`
- Filtrer par nom de test: `npx vitest -t "description"`
- Mode watch: `npm run test:watch` (re‑exécute au changement de fichiers)

---

## 8) Étapes suivantes (optionnel)

- Couverture: ajouter `"test:coverage": "vitest run --coverage"` dans `package.json`.
- Rendu de blocs: tests `@testing-library/react` sur `ContentBlock`, `ExpandableCard`, etc.
- API supplémentaires: `/api/admin/upload` (succès), `/api/admin/preview/enable|disable`.
- CI: GitHub Actions pour exécuter les tests à chaque PR.

---

## 9) FAQ rapide

- « Module not found @/… » → vérifier `vitest.config.ts` (alias) et relancer `npm install`.
- « Tests API échouent en jsdom » → ajouter `/* @vitest-environment node */` en haut du fichier.
- « Accès disque non souhaité » → mocker `node:fs` comme ci‑dessus.

