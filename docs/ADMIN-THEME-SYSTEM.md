# 🎨 Système de Thème Admin

## Vue d'ensemble

Ce système de thème admin centralise toutes les couleurs et styles de l'interface d'administration pour assurer une cohérence visuelle et faciliter la maintenance.

## 🎯 Avantages

- **Cohérence** : Toutes les couleurs admin sont centralisées
- **Maintenabilité** : Un seul endroit pour changer les couleurs
- **Performance** : Utilisation des variables CSS natives
- **Flexibilité** : Facile d'ajouter de nouvelles couleurs

## 📋 Variables CSS Disponibles

### Couleurs principales
```css
--admin-bg: #171717              /* Fond principal */
--admin-bg-hover: #2a2a2a        /* Fond au survol */
--admin-bg-active: #3a3a3a       /* Fond actif */
--admin-border: #2a2a2a          /* Bordures */
--admin-border-light: #3a3a3a    /* Bordures claires */
```

### Couleurs de texte
```css
--admin-text: #ffffff            /* Texte principal */
--admin-text-secondary: #cccccc  /* Texte secondaire */
--admin-text-muted: #999999      /* Texte atténué */
```

### Couleurs d'état
```css
--admin-success: #10b981         /* Succès (vert) */
--admin-warning: #f59e0b         /* Attention (orange) */
--admin-error: #ef4444           /* Erreur (rouge) */
--admin-info: #3b82f6            /* Information (bleu) */
```

### Couleurs de composants
```css
--admin-button-bg: var(--admin-bg)
--admin-button-hover: var(--admin-bg-hover)
--admin-input-bg: var(--admin-bg)
--admin-input-border: var(--admin-border)
--admin-card-bg: var(--admin-bg)
--admin-sidebar-bg: #0f0f0f
```

## 🚀 Classes Tailwind Disponibles

### Fond
- `bg-admin-bg` - Fond principal
- `bg-admin-bg-hover` - Fond au survol
- `bg-admin-bg-active` - Fond actif
- `bg-admin-card` - Fond des cartes
- `bg-admin-sidebar` - Fond de la sidebar

### Bordures
- `border-admin-border` - Bordure principale
- `border-admin-border-light` - Bordure claire

### Texte
- `text-admin-text` - Texte principal
- `text-admin-text-secondary` - Texte secondaire
- `text-admin-text-muted` - Texte atténué

### États
- `text-admin-success` - Texte de succès
- `text-admin-warning` - Texte d'attention
- `text-admin-error` - Texte d'erreur
- `text-admin-info` - Texte d'information

### Composants
- `bg-admin-button-bg` - Fond des boutons
- `hover:bg-admin-button-hover` - Fond des boutons au survol
- `bg-admin-input-bg` - Fond des inputs
- `border-admin-input-border` - Bordure des inputs

## 📝 Exemples d'utilisation

### Bouton admin
```jsx
<button className="bg-admin-bg hover:bg-admin-bg-hover text-admin-text border border-admin-border">
  Mon bouton
</button>
```

### Card admin
```jsx
<div className="bg-admin-card border border-admin-border text-admin-text">
  <h3 className="text-admin-text">Titre</h3>
  <p className="text-admin-text-secondary">Description</p>
</div>
```

### Input admin
```jsx
<input className="bg-admin-input-bg border border-admin-input-border text-admin-text" />
```

### Message d'erreur
```jsx
<div className="text-admin-error bg-admin-bg border border-admin-border">
  Erreur : {message}
</div>
```

## 🔧 Comment modifier les couleurs

### 1. Modifier les variables CSS
Éditer le fichier `src/app/globals.css` dans la section `/* ===== SYSTÈME DE THÈME ADMIN ===== */`

### 2. Redémarrer le serveur
```bash
npm run dev
```

### 3. Vérifier les changements
Toutes les classes admin seront automatiquement mises à jour.

## 📁 Fichiers concernés

- `src/app/globals.css` - Variables CSS
- `tailwind.config.mjs` - Configuration Tailwind
- `docs/ADMIN-THEME-SYSTEM.md` - Cette documentation

## 🎨 Palette de couleurs actuelle

```
Fond principal:    #171717 (admin-bg)
Fond hover:        #2a2a2a (admin-bg-hover)
Fond actif:        #3a3a3a (admin-bg-active)
Bordures:          #2a2a2a (admin-border)
Texte principal:   #ffffff (admin-text)
Texte secondaire:  #cccccc (admin-text-secondary)
Texte atténué:     #999999 (admin-text-muted)
```

## 🚀 Prochaines étapes

1. Appliquer ces classes à tous les composants admin
2. Créer des composants de base (Button, Card, Input) avec ces styles
3. Ajouter des variantes (primary, secondary, danger)
4. Créer un Storybook pour documenter les composants

