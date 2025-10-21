# 🎨 Audit d'Harmonisation CMS - Soliva Admin

**Date** : 21 octobre 2025  
**Agent** : UI/UX  
**Objectif** : Identifier les incohérences visuelles et fonctionnelles, proposer un plan d'harmonisation

---

## 📊 Résumé Exécutif

Votre CMS Soliva présente une **base solide** avec shadcn/ui et Tailwind CSS, mais souffre de **plusieurs incohérences** qui nuisent à l'expérience utilisateur et à la scalabilité. 

### ⚠️ Problèmes principaux identifiés
1. **Structures de layout inconsistantes** entre les pages
2. **Patterns de boutons variés** (classes inline vs composants shadcn)
3. **Gestion d'état hétérogène** (alert() vs toast vs inline messages)
4. **Spacing et padding non uniformes**
5. **Conventions de nommage mixtes** (.jsx et .tsx)

### ✅ Points forts
- Stack technique moderne (shadcn/ui, Tailwind, Lucide icons)
- Composants UI de base cohérents
- Système de blocs auto-déclarés bien structuré

---

## 🔍 Audit Détaillé

### 1. Structure des Pages Admin

#### ❌ Incohérences détectées

**Layout Structure - 3 patterns différents :**

| Page | Structure | Problème |
|------|-----------|----------|
| `admin/page.tsx` | `<div className="lg:ml-64"><main className="flex-1 p-6">` | ✅ **Standard** |
| `admin/ai/page.tsx` | `<div className="lg:ml-64"><main className="flex-1 p-6">` | ✅ **Corrigé** (aujourd'hui) |
| `admin/pages/page.tsx` | `<div className="flex"><div className="flex-1">` | ❌ **Différent** - pas de `<main>` |

**Headers - 2 styles différents :**

```tsx
// Style 1 : admin/page.tsx (✅ Complet)
<header className="bg-white border-b border-gray-200 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
      // Header + SaveBar intégrés
    </div>
  </div>
</header>

// Style 2 : admin/pages/page.tsx (❌ Minimaliste)
<header className="bg-white shadow-sm border-b border-gray-200">
  <div className="px-6 py-4">
    <div className="flex items-center justify-between">
      // Juste titre + description
    </div>
  </div>
</header>
```

#### ✅ Recommandations

**CRÉER** un composant `AdminPageLayout` standardisé :

```tsx
// src/app/admin/components/AdminPageLayout.tsx
interface AdminPageLayoutProps {
  title: string;
  description?: string;
  currentPage: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function AdminPageLayout({
  title,
  description,
  currentPage,
  actions,
  children
}: AdminPageLayoutProps) {
  return (
    <div className="admin-page min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} />
      
      <div className="lg:ml-64 flex flex-col">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-4xl font-semibold text-gray-900 mb-2">
                  {title}
                </h1>
                {description && (
                  <p className="text-sm text-gray-500">{description}</p>
                )}
              </div>
              {actions && <div className="flex gap-2">{actions}</div>}
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-6">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
```

---

### 2. Composants UI et Patterns

#### ❌ Incohérences détectées

**Boutons - 3 approches différentes :**

```tsx
// Approche 1 : Composant shadcn (✅ Recommandé)
<Button onClick={handleSave} className="bg-blue-600 text-white">
  Sauvegarder
</Button>

// Approche 2 : Classes inline natives (❌ Inconsistant)
<button
  onClick={handleSave}
  className="text-sm px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
>
  Sauvegarder
</button>

// Approche 3 : Classes colorées custom (❌ Non scalable)
<Button className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">
  Éditer
</Button>
```

**Fichiers mixtes (.jsx et .tsx) :**

| Composant | Extension | Problème |
|-----------|-----------|----------|
| `BlockEditor.tsx` | .tsx | ✅ TypeScript |
| `HeaderManager.jsx` | .jsx | ❌ Pas de types |
| `FooterManager.jsx` | .jsx | ❌ Pas de types |
| `TemplateManager.jsx` | .jsx | ❌ Pas de types |

#### ✅ Recommandations

**1. Standardiser tous les boutons avec variants shadcn :**

```tsx
// Créer des variants personnalisés dans tailwind.config.mjs
const buttonVariants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-600 text-white hover:bg-gray-700",
  success: "bg-green-600 text-white hover:bg-green-700",
  warning: "bg-orange-600 text-white hover:bg-orange-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "bg-gray-100 text-gray-700 hover:bg-gray-200"
};

// Utilisation :
<Button variant="primary">Publier</Button>
<Button variant="secondary">Enregistrer brouillon</Button>
<Button variant="danger" size="sm">Supprimer</Button>
```

**2. Migrer tous les .jsx vers .tsx progressivement**

**3. Créer un composant `ActionButtons` réutilisable :**

```tsx
// src/app/admin/components/ActionButtons.tsx
interface ActionButtonsProps {
  onEdit?: () => void;
  onPreview?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  size?: 'sm' | 'md';
}

export default function ActionButtons({
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  size = 'sm'
}: ActionButtonsProps) {
  return (
    <div className="flex space-x-2">
      {onEdit && (
        <Button variant="ghost" size={size} onClick={onEdit}>
          Éditer
        </Button>
      )}
      {onPreview && (
        <Button variant="ghost" size={size} onClick={onPreview}>
          Aperçu
        </Button>
      )}
      {onDuplicate && (
        <Button variant="ghost" size={size} onClick={onDuplicate}>
          Dupliquer
        </Button>
      )}
      {onDelete && (
        <Button variant="destructive" size={size} onClick={onDelete}>
          Supprimer
        </Button>
      )}
    </div>
  );
}
```

---

### 3. Patterns d'Interaction

#### ❌ Incohérences détectées

**Confirmations - 3 méthodes différentes :**

```tsx
// Méthode 1 : alert() natif (❌ Mauvaise UX)
if (!confirm('Êtes-vous sûr ?')) return;

// Méthode 2 : AlertDialog shadcn (✅ Recommandé)
<AlertDialog open={showDeleteConfirm}>
  <AlertDialogContent>
    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
    <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
  </AlertDialogContent>
</AlertDialog>

// Méthode 3 : Dialog custom (❌ Non standardisé)
<Dialog open={isDeleteModalOpen}>
  // Custom dialog
</Dialog>
```

**Notifications - 3 systèmes différents :**

```tsx
// Système 1 : alert() (❌ Archaïque)
alert('Page dupliquée avec succès !');

// Système 2 : Inline status (✅ Bon pour état persistant)
{saveStatus === 'success' && (
  <span className="text-sm text-green-600">Enregistré</span>
)}

// Système 3 : toast() sonner (✅ Recommandé pour actions)
toast.success('Article créé avec succès !');
```

#### ✅ Recommandations

**1. Créer un hook `useConfirmDialog` standardisé :**

```tsx
// src/hooks/useConfirmDialog.ts
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  }>();

  const confirm = (title: string, description: string) => {
    return new Promise<boolean>((resolve) => {
      setConfig({
        title,
        description,
        onConfirm: () => {
          setIsOpen(false);
          resolve(true);
        }
      });
      setIsOpen(true);
    });
  };

  const Dialog = () => (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{config?.title}</AlertDialogTitle>
          <AlertDialogDescription>{config?.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={config?.onConfirm}>
            Confirmer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirm, Dialog };
}

// Utilisation :
const { confirm, Dialog } = useConfirmDialog();

const handleDelete = async () => {
  if (await confirm('Supprimer cette page ?', 'Cette action est irréversible.')) {
    // Supprimer
  }
};

return <><Dialog />{/* rest */}</>
```

**2. Standardiser les notifications avec sonner :**

```tsx
// Remplacer TOUS les alert() par :
toast.success('Opération réussie !');
toast.error('Une erreur est survenue');
toast.info('Information importante');
toast.warning('Attention !');
```

---

### 4. Styling et Espacement

#### ❌ Incohérences détectées

**Padding des conteneurs - 3 valeurs différentes :**

```tsx
// admin/page.tsx
<main className="flex-1 p-6">

// admin/pages/page.tsx
<div className="p-6">

// admin/ai/page.tsx (avant correction)
<div className="flex-1 p-4 lg:p-6">
```

**Cards - Styles variés :**

```tsx
// Style 1 : Complet
<div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">

// Style 2 : Minimaliste
<div className="bg-white rounded-lg border border-gray-200 p-6">

// Style 3 : Custom
<div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
```

**Badges - Classes inconsistantes :**

```tsx
// Taille et padding variés
<span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
<span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
```

#### ✅ Recommandations

**1. Créer des classes Tailwind réutilisables :**

```css
/* src/app/globals.css */

/* Conteneurs admin */
.admin-container {
  @apply max-w-7xl mx-auto px-4 lg:px-6;
}

.admin-content {
  @apply flex-1 p-6;
}

/* Cards standardisées */
.admin-card {
  @apply bg-white rounded-lg border border-gray-200 p-6 shadow-sm;
}

.admin-card-compact {
  @apply bg-white rounded-lg border border-gray-200 p-4;
}

.admin-card-highlight {
  @apply bg-gray-50 rounded-lg border border-gray-200 p-4;
}

/* Sections */
.admin-section {
  @apply space-y-6;
}

.admin-section-header {
  @apply flex items-center justify-between mb-4;
}

.admin-section-title {
  @apply text-lg font-semibold text-gray-900;
}
```

**2. Standardiser les badges avec le composant shadcn :**

```tsx
// Utiliser le composant Badge avec variants
<Badge variant="success">Publié</Badge>
<Badge variant="warning">Brouillon</Badge>
<Badge variant="default">80%</Badge>
```

---

### 5. Gestion d'État et Modifications

#### ❌ Incohérences détectées

**Détection des modifications - 2 patterns différents :**

```tsx
// Pattern 1 : Comparaison manuelle avec originalContent
const hasChanges = content !== originalContent;

// Pattern 2 : Flag hasUnsavedChanges manuel
setHasUnsavedChanges(true);

// Pattern 3 : Event listeners custom
window.dispatchEvent(new CustomEvent('navigation-changed'));
```

**Save status - Variantes multiples :**

```tsx
// admin/page.tsx
const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>;

// admin/ai/page.tsx
const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>;

// Managers
// Pas de système unifié de status
```

#### ✅ Recommandations

**1. Créer un hook `useSaveStatus` unifié :**

```tsx
// src/hooks/useSaveStatus.ts
export function useSaveStatus() {
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const startSaving = () => setStatus('saving');
  
  const saveSuccess = () => {
    setStatus('success');
    setLastSaved(new Date());
    setTimeout(() => setStatus('idle'), 3000);
  };
  
  const saveError = () => {
    setStatus('error');
    setTimeout(() => setStatus('idle'), 3000);
  };

  const StatusIndicator = () => (
    <>
      {status === 'saving' && (
        <span className="text-sm text-gray-600 flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-b-2 border-blue-600 rounded-full" />
          Enregistrement...
        </span>
      )}
      {status === 'success' && lastSaved && (
        <span className="text-sm text-green-600">
          Enregistré à {lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
      {status === 'error' && (
        <span className="text-sm text-red-600">Erreur lors de l'enregistrement</span>
      )}
    </>
  );

  return {
    status,
    startSaving,
    saveSuccess,
    saveError,
    StatusIndicator
  };
}
```

**2. Créer un hook `useUnsavedChanges` pour la détection :**

```tsx
// src/hooks/useUnsavedChanges.ts
export function useUnsavedChanges<T>(initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [originalData, setOriginalData] = useState<T>(initialData);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed = JSON.stringify(data) !== JSON.stringify(originalData);
    setHasChanges(changed);
  }, [data, originalData]);

  const reset = () => {
    setData(originalData);
    setHasChanges(false);
  };

  const markAsSaved = () => {
    setOriginalData(data);
    setHasChanges(false);
  };

  return {
    data,
    setData,
    hasChanges,
    reset,
    markAsSaved
  };
}
```

---

## 📋 Plan d'Action Prioritaire

### 🔴 Priorité HAUTE (Sprint 1 - 1 semaine)

1. ✅ **Layout standard** : Créer `AdminPageLayout` et migrer toutes les pages
2. ✅ **Boutons** : Standardiser avec variants shadcn/ui
3. ✅ **Confirmations** : Remplacer tous les `alert()` par `AlertDialog` ou hook `useConfirmDialog`
4. ✅ **Notifications** : Remplacer tous les `alert()` par `toast()`

### 🟡 Priorité MOYENNE (Sprint 2 - 1 semaine)

5. **Cards** : Appliquer classes CSS standardisées
6. **Badges** : Utiliser composant shadcn avec variants
7. **État** : Implémenter hooks `useSaveStatus` et `useUnsavedChanges`
8. **TypeScript** : Migrer HeaderManager, FooterManager, TemplateManager vers .tsx

### 🟢 Priorité BASSE (Sprint 3 - 1 semaine)

9. **Classes CSS** : Créer utilities Tailwind réutilisables
10. **Documentation** : Mettre à jour AGENT-UI.md avec nouveaux patterns
11. **Tests** : Valider cohérence visuelle sur toutes les pages
12. **Performance** : Optimiser re-renders inutiles

---

## 🎯 Checklist de Conformité

Utilisez cette checklist pour valider la conformité de chaque nouvelle page/composant :

### Structure
- [ ] Utilise `AdminPageLayout` ou structure standardisée
- [ ] Header sticky avec `z-50`
- [ ] Main avec `flex-1 p-6`
- [ ] Container avec `max-w-7xl mx-auto`

### Composants UI
- [ ] Boutons avec composant `Button` de shadcn
- [ ] Variants appropriés (`primary`, `secondary`, `danger`)
- [ ] Icons de Lucide React
- [ ] Badges avec composant `Badge` de shadcn

### Interactions
- [ ] Confirmations avec `AlertDialog` (pas `alert()`)
- [ ] Notifications avec `toast()` de sonner (pas `alert()`)
- [ ] Formulaires avec composants shadcn (`Input`, `Textarea`, etc.)

### Styling
- [ ] Cards avec classes standardisées (`.admin-card`)
- [ ] Spacing cohérent (`gap-2`, `gap-4`, `space-y-6`)
- [ ] Couleurs de la palette (`blue-600`, `gray-50`, etc.)
- [ ] Responsive avec `lg:` breakpoints

### Code
- [ ] TypeScript (.tsx) pour nouveaux composants
- [ ] Types définis pour props et state
- [ ] Pas de `console.log` en production
- [ ] Pas de `any` (sauf exceptions documentées)

---

## 🚀 Quick Wins (30min chacun)

### 1. Remplacer tous les `alert()` par `toast()`

```bash
# Rechercher tous les alert()
grep -r "alert(" src/app/admin --include="*.tsx" --include="*.jsx"

# Remplacer par toast()
```

### 2. Standardiser les classes de boutons

```bash
# Rechercher les boutons inline
grep -r 'className=".*px-.*py-.*rounded' src/app/admin

# Remplacer par <Button>
```

### 3. Uniformiser le padding des pages

```bash
# Rechercher les variantes de padding
grep -r 'p-4\|p-6\|px-\|py-' src/app/admin/**/page.tsx
```

---

## 📚 Ressources et Références

### Documentation
- **shadcn/ui** : https://ui.shadcn.com/
- **Tailwind CSS** : https://tailwindcss.com/docs
- **Lucide Icons** : https://lucide.dev/icons/

### Composants à favoriser
- `Button` : Pour tous les boutons
- `AlertDialog` : Pour les confirmations
- `Sheet` : Pour les sidepanels
- `Dialog` : Pour les modals
- `Input` / `Textarea` : Pour les formulaires
- `Badge` : Pour les statuts
- `toast()` : Pour les notifications

### Anti-patterns à éviter
- ❌ `alert()` / `confirm()` natifs
- ❌ Classes Tailwind inline sur boutons
- ❌ Structures de layout custom
- ❌ Fichiers .jsx pour nouveaux composants
- ❌ `any` en TypeScript

---

## 💡 Exemples de Refactoring

### Avant / Après : Page Admin

**❌ Avant (inconsistant) :**

```tsx
export default function MyAdminPage() {
  const [data, setData] = useState(null);
  
  const handleSave = async () => {
    if (!confirm('Sauvegarder ?')) return;
    
    try {
      await fetch('/api/save', { method: 'POST', body: JSON.stringify(data) });
      alert('Sauvegardé !');
    } catch (error) {
      alert('Erreur');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPage="my-page" />
      <div className="flex-1 p-4">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Ma Page</h1>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sauvegarder
          </button>
        </div>
        {/* Contenu */}
      </div>
    </div>
  );
}
```

**✅ Après (harmonisé) :**

```tsx
export default function MyAdminPage() {
  const { data, setData, hasChanges, markAsSaved } = useUnsavedChanges(initialData);
  const { status, startSaving, saveSuccess, saveError, StatusIndicator } = useSaveStatus();
  const { confirm, Dialog: ConfirmDialog } = useConfirmDialog();

  const handleSave = async () => {
    if (!await confirm('Sauvegarder les modifications ?', 'Les changements seront publiés immédiatement.')) {
      return;
    }

    startSaving();
    
    try {
      await fetch('/api/save', { 
        method: 'POST', 
        body: JSON.stringify(data) 
      });
      markAsSaved();
      saveSuccess();
      toast.success('Modifications enregistrées !');
    } catch (error) {
      saveError();
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  return (
    <AdminPageLayout
      title="Ma Page"
      description="Configuration de ma page"
      currentPage="my-page"
      actions={
        <>
          <StatusIndicator />
          {hasChanges && (
            <Badge variant="warning">Modifications non enregistrées</Badge>
          )}
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={!hasChanges || status === 'saving'}
          >
            {status === 'saving' ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </>
      }
    >
      <div className="admin-section">
        <div className="admin-card">
          {/* Contenu */}
        </div>
      </div>
      
      <ConfirmDialog />
    </AdminPageLayout>
  );
}
```

---

## 📊 Métriques de Succès

### KPIs à suivre

1. **Cohérence** : 100% des pages utilisent `AdminPageLayout`
2. **Modernité** : 0 `alert()` / `confirm()` natifs restants
3. **TypeScript** : 100% des composants admin en .tsx
4. **Performance** : Temps de chargement < 500ms
5. **Accessibilité** : Score Lighthouse > 90%

### Validation

```bash
# Vérifier l'absence de patterns obsolètes
grep -r "alert(" src/app/admin --include="*.tsx" --include="*.jsx" | wc -l  # Doit être 0
grep -r "confirm(" src/app/admin --include="*.tsx" --include="*.jsx" | wc -l  # Doit être 0

# Vérifier la migration TypeScript
find src/app/admin -name "*.jsx" | wc -l  # Doit diminuer progressivement
```

---

## 🎓 Formation Équipe

### Règles d'or pour l'équipe

1. **Toujours utiliser `AdminPageLayout`** pour nouvelles pages
2. **Jamais de `alert()` / `confirm()`** → Utiliser `toast()` et `AlertDialog`
3. **Boutons = composant `Button`** avec variants appropriés
4. **TypeScript pour nouveaux composants** (.tsx)
5. **Consulter ce document** avant de créer un nouveau composant

### Revue de code

Lors des reviews, vérifier systématiquement :
- [ ] Respect de `AdminPageLayout`
- [ ] Pas de `alert()` / `confirm()`
- [ ] Boutons avec composant shadcn
- [ ] Types TypeScript corrects
- [ ] Classes CSS standardisées

---

## 📞 Contact & Support

Pour toute question sur l'harmonisation :
- **Documentation** : `docs/agents/AGENT-UI.md`
- **Exemples** : `docs/AUDIT-HARMONISATION-CMS.md` (ce document)
- **Agent** : Mentionner `@AGENT-UI` dans vos prompts Cursor

---

**Version** : 1.0  
**Dernière mise à jour** : 21 octobre 2025  
**Auteur** : Agent UI/UX

