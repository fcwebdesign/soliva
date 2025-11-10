# 📝 Mémo : Ajouter une nouvelle page dans le BO

Quand vous ajoutez une nouvelle section dans le backoffice (comme Typography, Reveal, etc.), suivez ces étapes :

## ✅ Checklist complète

### 1. Créer le composant de section
- Créer le fichier : `src/app/admin/components/sections/MaSection.tsx`
- Utiliser le pattern de `RevealSection.tsx` ou `TypographySection.tsx` comme référence
- Interface : `{ localData: any; updateField: (path: string, value: any) => void }`

### 2. Ajouter dans AdminContent.tsx
```tsx
import MaSection from './sections/MaSection';

// Dans renderContent()
if (currentPage === 'ma-page') {
  return (
    <MaSection
      localData={content || {}}
      updateField={(path, value) => {
        const keys = path.split('.');
        const newContent = { ...content };
        let current = newContent as any;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        onUpdateContent(newContent as Content);
      }}
    />
  );
}
```

### 3. Ajouter dans la Sidebar
Dans `src/app/admin/components/Sidebar.tsx` :
```tsx
import { MonIcone } from 'lucide-react'; // Ajouter l'icône

const SETTINGS = [
  // ...
  { id: 'ma-page', label: 'Ma Page', path: null, icon: MonIcone },
];
```

### 4. ⚠️ IMPORTANT : Ajouter dans getPageConfig
Dans `src/app/admin/hooks/useAdminPage.ts` :
```tsx
const getPageConfig = (pageId: string) => {
  const pageConfigs = {
    // ...
    'ma-page': { label: 'Ma Page', path: null, icon: '🔤' },
    // ...
  };
  return pageConfigs[pageId as keyof typeof pageConfigs];
};
```

**⚠️ SANS CETTE ÉTAPE, LA PAGE RESTE BLANCHE !**

### 5. (Optionnel) Ajouter dans getPagePath
Si la page a un chemin frontend :
```tsx
const getPagePath = (pageId: string) => {
  const pageConfigs = {
    // ...
    'ma-page': '/ma-page',
    // ...
  };
  return pageConfigs[pageId as keyof typeof pageConfigs] || '/';
};
```

## 📋 Structure de données recommandée

Stockez les données dans `metadata` pour les configurations globales :
```json
{
  "metadata": {
    "ma-page": {
      "option1": "valeur1",
      "option2": "valeur2"
    }
  }
}
```

## 🎯 Exemple complet : Typography

1. ✅ `src/app/admin/components/sections/TypographySection.tsx` créé
2. ✅ Ajouté dans `AdminContent.tsx` (ligne 96)
3. ✅ Ajouté dans `Sidebar.tsx` (ligne 60)
4. ✅ Ajouté dans `useAdminPage.ts` → `getPageConfig` (ligne 42)
5. ✅ Données stockées dans `metadata.typography`

## 🚨 Erreurs courantes

- ❌ Page blanche → Oubli d'ajouter dans `getPageConfig`
- ❌ Page non trouvée → Oubli d'ajouter dans `Sidebar.tsx`
- ❌ Erreur de rendu → Oubli d'ajouter dans `AdminContent.tsx`
- ❌ Données non sauvegardées → Vérifier `updateField` et le path

## 💡 Astuce

Copiez-collez une section existante (RevealSection ou TypographySection) et adaptez-la. C'est plus rapide et moins d'erreurs !

