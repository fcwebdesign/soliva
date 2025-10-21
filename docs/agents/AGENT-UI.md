# 🎨 Agent UI/UX - Gardien de l'harmonie visuelle

## 📋 Mission

Assurer la **cohérence et la scalabilité** de l'interface admin du CMS sans refaire l'existant.

**Principe** : Capitaliser sur ce qui marche, standardiser progressivement, améliorer la scalabilité.

---

## 🎯 Stack UI existante (à respecter)

### Composants de base
- **shadcn/ui** : Bibliothèque de composants (Button, Sheet, Dialog, AlertDialog, Input, etc.)
- **Tailwind CSS** : Styling utility-first
- **lucide-react** : Icônes
- **sonner** : Notifications toast
- **react-dom** : `createPortal` pour les modals

### Où trouver les composants
- `src/components/ui/` : Composants shadcn/ui
- `src/app/admin/components/` : Composants admin spécifiques

---

## ✅ Patterns UI validés (à réutiliser)

### 🔘 Boutons

#### Bouton principal
```tsx
import { Button } from "@/components/ui/button";

<Button 
  onClick={handleClick}
  className="flex items-center gap-2"
>
  <Icon className="w-4 h-4" />
  Texte du bouton
</Button>
```

#### Bouton secondaire
```tsx
<Button 
  variant="outline"
  onClick={handleClick}
  className="flex items-center gap-2"
>
  <Icon className="w-4 h-4" />
  Texte
</Button>
```

#### Bouton danger
```tsx
<Button 
  variant="destructive"
  onClick={handleDelete}
>
  Supprimer
</Button>
```

#### Bouton natif (dans modals/forms)
```tsx
<button
  onClick={handleClick}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
>
  Action
</button>
```

---

### 📝 Inputs

#### Input texte
```tsx
import { Input } from "@/components/ui/input";

<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Titre
  </label>
  <Input
    type="text"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    placeholder="Placeholder..."
    className="w-full"
  />
</div>
```

#### Textarea
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Description
  </label>
  <textarea
    value={value}
    onChange={(e) => setValue(e.target.value)}
    rows={3}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    placeholder="Texte..."
  />
</div>
```

#### Select
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Statut
  </label>
  <select
    value={value}
    onChange={(e) => setValue(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
  >
    <option value="draft">Brouillon</option>
    <option value="published">Publié</option>
  </select>
</div>
```

---

### 🎴 Cards & Containers

#### Card basique
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Titre</h3>
  {/* Contenu */}
</div>
```

#### Card avec header
```tsx
<div className="bg-white rounded-lg border border-gray-200 shadow-sm">
  <div className="flex items-center space-x-2 p-6 pb-4 border-b border-gray-200">
    <Icon className="w-6 h-6 text-gray-600" />
    <h3 className="text-lg font-semibold text-gray-900">Titre</h3>
  </div>
  <div className="p-6">
    {/* Contenu */}
  </div>
</div>
```

---

### 🔔 Notifications

#### Toast (recommandé pour actions simples)
```tsx
import { toast } from 'sonner';

// Succès
toast.success('Action réussie !');

// Erreur
toast.error('Erreur lors de l\'action');

// Avec description
toast.success('Article créé', {
  description: 'Vous pouvez maintenant l\'éditer',
  duration: 5000
});
```

#### Modal de notification (pour actions critiques)
```tsx
{showNotification && createPortal(
  <div 
    className="fixed inset-0 flex items-center justify-center z-[9999]"
    style={{
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(2px)'
    }}
  >
    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
      <div className="text-center">
        <div className="text-4xl mb-4 text-green-500">✅</div>
        <h3 className="text-lg font-semibold mb-2">Succès</h3>
        <p className="text-gray-600 mb-6">Message</p>
        <button
          onClick={() => setShowNotification(false)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  </div>,
  document.body
)}
```

---

### 📱 Modals

#### Sheet (sidebar qui glisse)
```tsx
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetTrigger asChild>
    <Button>Ouvrir</Button>
  </SheetTrigger>
  <SheetContent side="right" className="w-80">
    <SheetHeader>
      <SheetTitle>Titre</SheetTitle>
      <SheetDescription>Description</SheetDescription>
    </SheetHeader>
    {/* Contenu */}
  </SheetContent>
</Sheet>
```

#### AlertDialog (confirmation)
```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

<AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Supprimer le bloc</AlertDialogTitle>
      <AlertDialogDescription>
        Êtes-vous sûr ? Cette action est irréversible.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Annuler</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>
        Supprimer
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

### 🎨 Couleurs standardisées

#### États
- **Primary** : `bg-blue-600 hover:bg-blue-700 text-white`
- **Success** : `bg-green-100 text-green-700` (badge), `text-green-500` (icône)
- **Warning** : `bg-yellow-100 text-yellow-700`
- **Error** : `bg-red-100 text-red-700` / `bg-red-600 text-white` (bouton)
- **Neutral** : `bg-gray-100 text-gray-700 hover:bg-gray-200`

#### Texte
- **Primary** : `text-gray-900` (titres)
- **Secondary** : `text-gray-700` (labels)
- **Tertiary** : `text-gray-600` (descriptions)
- **Muted** : `text-gray-500` (helper text)

#### Backgrounds
- **Page** : `bg-gray-50`
- **Card** : `bg-white`
- **Hover** : `hover:bg-gray-50`
- **Active** : `bg-blue-50 text-blue-700`

---

### 🔤 Typographie

#### Titres
- **H1** : `text-2xl md:text-3xl font-bold text-gray-900`
- **H2** : `text-xl font-semibold text-gray-900`
- **H3** : `text-lg font-semibold text-gray-900`
- **H4** : `text-md font-medium text-gray-900`

#### Labels
```tsx
<label className="block text-sm font-medium text-gray-700 mb-2">
  Label
</label>
```

#### Helper text
```tsx
<p className="text-xs text-gray-500 mt-1">
  Texte d'aide
</p>
```

---

### 📏 Espacements

#### Padding
- **Petit** : `p-4`
- **Moyen** : `p-6` (standard cards)
- **Grand** : `p-8`

#### Gap
- **Liste** : `space-y-4` ou `space-y-6`
- **Flex** : `gap-2` (petits éléments), `gap-4` (éléments moyens)
- **Grid** : `gap-3` ou `gap-4`

#### Margin
- **Entre sections** : `mb-6` ou `mt-8`
- **Entre éléments** : `mb-2` (label → input), `mb-4` (éléments de form)

---

## 🚨 Règles à respecter

### ✅ À TOUJOURS faire

1. **Utiliser shadcn/ui** pour les composants interactifs (Button, Input, Sheet, Dialog)
2. **Classes Tailwind standards** (voir patterns ci-dessus)
3. **Icônes lucide-react** : `<Icon className="w-4 h-4" />` ou `w-5 h-5`
4. **Toast sonner** pour notifications simples
5. **Transitions** : `transition-colors` sur les interactions
6. **Focus states** : `focus:ring-2 focus:ring-blue-500`
7. **Responsive** : `md:` breakpoints quand nécessaire
8. **Accessibilité** : Labels sur inputs, titles sur boutons

### ❌ À NE JAMAIS faire

1. ❌ Créer des boutons custom au lieu d'utiliser `<Button>`
2. ❌ Mélanger styles inline et Tailwind
3. ❌ Oublier les états hover/focus
4. ❌ Hardcoder des couleurs (#hex) au lieu d'utiliser Tailwind
5. ❌ Créer des composants UI dupliqués
6. ❌ Négliger le responsive
7. ❌ Utiliser des modals pour tout (privilégier toast)

---

## 🔧 Checklist pour nouveaux blocs/features

Avant de valider un nouveau bloc ou une feature :

- [ ] Utilise `<Button>` de shadcn/ui (pas de bouton custom)
- [ ] Inputs avec labels et classes Tailwind standards
- [ ] Couleurs cohérentes (blue-600, green-500, etc.)
- [ ] Espacements cohérents (p-6, space-y-4, gap-2)
- [ ] Transitions sur hover/focus
- [ ] Icônes lucide-react avec taille cohérente (w-4 h-4 ou w-5 h-5)
- [ ] Toast sonner pour notifications simples
- [ ] Responsive si nécessaire
- [ ] Accessibilité (labels, titles, aria)

---

## 📦 Composants à créer (si besoin futur)

### Patterns récurrents à extraire

Si un pattern se répète 3+ fois, créer un composant réutilisable :

**Exemple : Card avec header et actions**
```tsx
// src/components/admin/ActionCard.tsx
export function ActionCard({ 
  title, 
  icon: Icon, 
  children,
  actions 
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between p-6 pb-4 border-b">
        <div className="flex items-center space-x-2">
          <Icon className="w-6 h-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex gap-2">{actions}</div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
```

---

## 🎯 Roadmap UI/UX

### Phase 1 : Documentation (✅ fait)
- Documenter patterns existants
- Guidelines pour nouveaux développements

### Phase 2 : Audit et harmonisation (à venir)
- Auditer les blocs existants
- Lister les incohérences
- Standardiser progressivement

### Phase 3 : Scalabilité (à venir)
- Créer composants réutilisables pour patterns récurrents
- Design tokens (variables CSS)
- Storybook ou documentation visuelle

---

## 💡 Conseils pour les autres agents

### Agent BLOCKS
- Toujours utiliser `<Button>` de shadcn/ui
- Labels en français avec classes standards
- Inputs cohérents avec le reste de l'admin
- Vérifier la checklist avant de finaliser

### Agent CONTENT
- Toast sonner pour notifications
- Pas de styles custom dans les modals

### Agent API
- Logs d'erreur cohérents
- Messages d'erreur clairs pour l'utilisateur

---

**Version** : 1.0  
**Dernière mise à jour** : 21 octobre 2025  
**Mainteneur** : Agent UI/UX

