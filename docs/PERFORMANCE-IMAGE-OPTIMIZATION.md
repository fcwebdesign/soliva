# 🖼️ Guide d'Optimisation des Images

## ✅ Vérification que l'optimisation fonctionne

### 1. **Test automatique**
```bash
node scripts/test-image-optimization.js
```

### 2. **Test manuel dans le navigateur**

#### **A. DevTools Network**
1. Ouvre http://localhost:3000
2. **F12** → **Network** → **Images**
3. Recharge la page
4. Vérifie :
   - **URLs** : `/_next/static/media/...` (pas `/hero.jpg`)
   - **Content-Type** : `image/webp` ou `image/avif`
   - **Size** : Réduite par rapport à l'original
   - **Time** : Chargement rapide

#### **B. Vérification des formats**
```bash
# Test direct d'une image optimisée
curl -I "http://localhost:3000/_next/image?url=%2Fhero.jpg&w=1920&q=75"
```

### 3. **Outils de performance**

#### **PageSpeed Insights**
- URL : https://pagespeed.web.dev/
- Teste ton site en production
- Vérifie le score "Images" dans "Opportunities"

#### **GTmetrix**
- URL : https://gtmetrix.com/
- Analyse complète des performances
- Section "Images" pour les détails

#### **WebPageTest**
- URL : https://www.webpagetest.org/
- Test avancé avec waterfall
- Vérifie les formats d'images

## 🔧 Configuration actuelle

### **Next.js Image Component**
```typescript
// ✅ Utilisé dans tous les composants
import Image from 'next/image';

<Image 
  src="/hero.jpg"
  alt="Description"
  width={1920}
  height={857}
  priority={true} // Pour les images above-the-fold
  placeholder="blur" // Pour le lazy loading
/>
```

### **Configuration next.config.mjs**
```javascript
images: {
  formats: ['image/avif', 'image/webp'], // Formats optimisés
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60,
}
```

## 📊 Métriques à surveiller

### **Core Web Vitals**
- **LCP** (Largest Contentful Paint) : < 2.5s
- **CLS** (Cumulative Layout Shift) : < 0.1
- **FID** (First Input Delay) : < 100ms

### **Images spécifiques**
- **Taille** : Réduite de 30-70% vs original
- **Format** : WebP/AVIF préférés
- **Lazy loading** : Images below-the-fold
- **Cache** : Headers appropriés

## 🚀 Optimisations appliquées

### ✅ **Automatiques (Next.js)**
- Conversion WebP/AVIF
- Redimensionnement adaptatif
- Lazy loading
- Compression
- Cache headers

### ✅ **Manuelles (Configuration)**
- Formats prioritaires
- Tailles d'écran
- Cache TTL
- Sécurité SVG

## 🔍 Dépannage

### **Images non optimisées**
```bash
# Vérifier que next/image est utilisé
grep -r "next/image" src/components/
```

### **Formats non supportés**
```bash
# Vérifier la configuration
cat next.config.mjs | grep -A 10 "images:"
```

### **Cache non fonctionnel**
```bash
# Vérifier les headers
curl -I http://localhost:3000/_next/static/media/hero.jpg
```

## 📈 Résultats attendus

### **Avant optimisation**
- Images JPEG/PNG originales
- Tailles importantes (500KB+)
- Pas de lazy loading
- Cache minimal

### **Après optimisation**
- Images WebP/AVIF
- Tailles réduites (50-200KB)
- Lazy loading actif
- Cache optimisé

## 🎯 Prochaines étapes

1. **Tester en production** avec PageSpeed Insights
2. **Analyser les métriques** Core Web Vitals
3. **Optimiser les images** les plus lourdes
4. **Implémenter** le lazy loading avancé
5. **Configurer** un CDN si nécessaire
