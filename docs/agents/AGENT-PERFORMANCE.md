# 🚀 Agent PERFORMANCE - Optimisation Core Web Vitals

## 📋 Vue d'ensemble

L'**Agent PERFORMANCE** est responsable de l'optimisation des performances du site, des Core Web Vitals, et de l'expérience utilisateur.

---

## 🎯 **Quand l'utiliser**

**Utilisez l'Agent PERFORMANCE pour :**
- Optimiser les images (Next.js Image, lazy loading, formats modernes)
- Réduire le JavaScript bundle (code splitting, lazy loading)
- Améliorer les Core Web Vitals (LCP, FID, CLS)
- Optimiser les fonts et CSS
- Implémenter le caching et la compression
- Analyser et optimiser les performances

---

## 🛠️ **Compétences**

### 🖼️ **Optimisation Images**
- Migration vers Next.js Image
- Lazy loading intelligent
- Formats modernes (WebP, AVIF)
- Responsive images
- Placeholder et blur

### 📦 **Bundle Optimization**
- Code splitting des composants lourds
- Lazy loading des librairies (GSAP, Framer Motion)
- Tree shaking des dépendances
- Bundle analysis

### ⚡ **Core Web Vitals**
- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms
- CLS (Cumulative Layout Shift) < 0.1

### 🎨 **Fonts & CSS**
- Font-display: swap
- Preload des fonts critiques
- CSS optimization
- Critical CSS

### 🗄️ **Caching & Compression**
- Service Worker
- CDN configuration
- Compression gzip/brotli
- Cache headers

### 📊 **Tests et Monitoring**
- **Lighthouse automatisé** avec barre de progression
- Core Web Vitals monitoring
- Performance budgets
- Bundle analysis
- Tests de performance en local

---

## 📁 **Localisation**

**Fichiers principaux :**
- `src/components/optimized/` - Composants optimisés
- `src/utils/performance/` - Utilitaires performance
- `next.config.mjs` - Configuration Next.js
- `docs/performance/` - Documentation performance

---

## 🚀 **Actions principales**

### 1. **Optimisation Images**
```typescript
// Remplacer <img> par Next.js Image
import Image from 'next/image';

<Image
  src={image.src}
  alt={image.alt}
  width={800}
  height={600}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### 2. **Lazy Loading GSAP**
```typescript
// Charger GSAP seulement quand nécessaire
const loadGSAP = async () => {
  const { default: gsap } = await import('gsap');
  const { default: SplitText } = await import('gsap/SplitText');
  // Animation...
};
```

### 3. **Code Splitting**
```typescript
// Composants lourds en lazy loading
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false
});
```

### 4. **Fonts Optimisées**
```css
/* Preload des fonts critiques */
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>

/* Font-display swap */
@font-face {
  font-family: 'Inter';
  font-display: swap;
}
```

---

## 📊 **Métriques de performance**

### **Core Web Vitals**
- **LCP** : < 2.5s (Excellent)
- **FID** : < 100ms (Excellent)
- **CLS** : < 0.1 (Excellent)

### **Autres métriques**
- **TTFB** : < 600ms
- **Bundle size** : < 250KB (gzipped)
- **Images** : WebP/AVIF + lazy loading

---

## 🛠️ **Outils utilisés**

### **Analyse**
- `@next/bundle-analyzer` - Analyse du bundle
- `lighthouse` - Audit performance
- `web-vitals` - Mesure des Core Web Vitals

### **Optimisation**
- `next/image` - Images optimisées
- `next/dynamic` - Code splitting
- `next/font` - Fonts optimisées

### **Monitoring**
- `@vercel/analytics` - Analytics performance
- `@vercel/speed-insights` - Speed insights

---

## 📚 **Documentation**

### **Guides**
- `docs/performance/IMAGE-OPTIMIZATION.md` - Guide images
- `docs/performance/BUNDLE-OPTIMIZATION.md` - Guide bundle
- `docs/performance/CORE-WEB-VITALS.md` - Guide Core Web Vitals

### **Templates**
- `src/components/optimized/OptimizedImage.tsx` - Image optimisée
- `src/components/optimized/LazyComponent.tsx` - Composant lazy
- `src/utils/performance/analytics.ts` - Analytics performance

---

## 🎯 **Exemples de prompts**

### **Optimisation images**
```
@AGENT-PERFORMANCE Optimise toutes les images du site avec Next.js Image,
lazy loading et formats modernes (WebP/AVIF)
```

### **Bundle optimization**
```
@AGENT-PERFORMANCE Analyse le bundle et implémente le code splitting
pour GSAP, Framer Motion et les composants lourds
```

### **Core Web Vitals**
```
@AGENT-PERFORMANCE Améliore les Core Web Vitals : LCP < 2.5s, FID < 100ms, CLS < 0.1
```

### **Fonts optimization**
```
@AGENT-PERFORMANCE Optimise les fonts avec preload, font-display: swap
et fallback appropriés
```

---

## ✅ **Checklist performance**

### **Images**
- [ ] Next.js Image partout
- [ ] Lazy loading implémenté
- [ ] Formats modernes (WebP/AVIF)
- [ ] Responsive images
- [ ] Placeholder blur

### **JavaScript**
- [ ] Code splitting des composants lourds
- [ ] Lazy loading des librairies
- [ ] Tree shaking activé
- [ ] Bundle < 250KB gzipped

### **Fonts**
- [ ] Font-display: swap
- [ ] Preload des fonts critiques
- [ ] Fallbacks appropriés
- [ ] Subset des fonts

### **Core Web Vitals**
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] TTFB < 600ms

### **Tests et Monitoring**
- [ ] Lighthouse automatisé configuré
- [ ] Tests de performance en local
- [ ] Monitoring Core Web Vitals
- [ ] Rapports de performance générés

---

## 🧪 **Tests de Performance**

### **Commandes disponibles**
```bash
# Test page d'accueil seulement
npm run lighthouse

# Test page work seulement  
npm run lighthouse:work

# Test page blog seulement
npm run lighthouse:blog

# Test toutes les pages (recommandé)
npm run lighthouse:all
```

### **Fonctionnalités du test automatisé**
- ✅ **Barre de progression** visuelle
- ✅ **Timer en temps réel** pour chaque page
- ✅ **Temps estimé** total (10-15 minutes)
- ✅ **Progression** claire (1/5, 2/5, etc.)
- ✅ **Résumé final** avec temps par page
- ✅ **Rapports HTML** sauvegardés automatiquement

### **Comment utiliser**
1. **Démarrer le serveur** : `npm run dev`
2. **Lancer les tests** : `npm run lighthouse:all`
3. **Analyser les rapports** HTML générés
4. **Suivre les recommandations** Lighthouse

---

## 🚨 **Règles importantes**

1. **Toujours mesurer** avant/après les optimisations
2. **Priorité mobile** : Optimiser d'abord pour mobile
3. **Progressive enhancement** : Fonctionnalité de base d'abord
4. **Monitoring continu** : Surveiller les métriques en production

---

**Version** : 1.0  
**Dernière mise à jour** : 23 octobre 2025
