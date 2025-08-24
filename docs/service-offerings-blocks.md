# Bloc Services avec IA

## Vue d'ensemble

Le bloc Services permet d'afficher vos offres de services de manière structurée et professionnelle. Il est maintenant intégré avec l'IA pour générer automatiquement du contenu cohérent et impactant.

## Type de bloc disponible

### Services (Groupe de services)
Affiche une section complète avec plusieurs services.

**Structure :**
```typescript
{
  id: string;
  type: 'services';
  title?: string;
  offerings: Array<{
    id: string;
    title: string;
    description: string;
    icon?: string;
  }>;
}
```

## Intégration IA 🤖

### Fonctionnalités IA

Le bloc Services est maintenant équipé d'un bouton IA qui permet de :

- **Générer automatiquement** le contenu des services
- **Créer des titres impactants** et mémorables
- **Rédiger des descriptions concrètes** et professionnelles
- **Suggérer des icônes appropriées** pour chaque service
- **Maintenir la cohérence** avec le style de votre site

### Comment utiliser l'IA

1. **Dans l'interface admin** (`/admin`)
2. **Ajoutez un nouveau bloc** de type "Services"
3. **Cliquez sur le bouton "🤖 Suggestion IA"**
4. **L'IA génère automatiquement** le contenu approprié
5. **Personnalisez** selon vos besoins

### Exemple de contenu généré par IA

#### Services
```json
{
  "title": "NOS EXPERTISES",
  "offerings": [
    {
      "id": "service-1",
      "title": "Design d'Identité",
      "description": "Logos, chartes graphiques, supports de communication. Identité visuelle cohérente et mémorable.",
      "icon": "🎨"
    },
    {
      "id": "service-2", 
      "title": "Développement Web",
      "description": "Sites vitrines, e-commerce, applications sur mesure. Technologies modernes, performance optimale.",
      "icon": "💻"
    },
    {
      "id": "service-3",
      "title": "Marketing Digital", 
      "description": "Stratégie, SEO, réseaux sociaux, publicité ciblée. Augmentation de votre visibilité et de vos conversions.",
      "icon": "📈"
    }
  ]
}
```

## Utilisation dans le code

### Ajout d'un bloc services

```jsx
import Services from '@/blocks/defaults/Services';

// Dans votre composant
<Services
  title="NOS EXPERTISES"
  offerings={[
    {
      id: "service-1",
      title: "Design d'Identité",
      description: "Logos, chartes graphiques...",
      icon: "🎨"
    },
    // ... autres services
  ]}
/>
```

## Styles CSS

Les blocs utilisent les classes CSS suivantes :

- `.service-offering-block` : Conteneur principal d'un service
- `.service-offerings-section` : Section contenant plusieurs services
- `.service-offering-block h3` : Titre du service
- `.service-offering-block p` : Description du service

### Responsive Design

Les blocs sont entièrement responsives :
- **Desktop** : Layout en grille 12 colonnes
- **Mobile** : Layout en colonne unique
- **Tablet** : Adaptation automatique

## Personnalisation

### Modifier les styles

Vous pouvez personnaliser l'apparence en modifiant les classes CSS dans `src/app/globals.css` :

```css
.service-offering-block {
  /* Vos styles personnalisés */
}

.service-offering-block h3 {
  /* Personnalisation du titre */
}

.service-offering-block p {
  /* Personnalisation de la description */
}
```

### Ajouter des fonctionnalités

Pour étendre les fonctionnalités, modifiez les composants dans `src/blocks/defaults/` :

- `ServiceOffering.tsx` : Composant pour un service individuel
- `ServiceOfferings.tsx` : Composant pour un groupe de services

## Tests

### Scripts de test disponibles

```javascript
// Test de l'IA pour service-offering
import { testServiceOfferingIA } from '@/test-service-blocks-ia.js';
await testServiceOfferingIA();

// Test de l'IA pour service-offerings  
import { testServiceOfferingsIA } from '@/test-service-blocks-ia.js';
await testServiceOfferingsIA();
```

### Test dans l'interface admin

1. Allez sur `/admin`
2. Ajoutez un bloc de service
3. Cliquez sur le bouton IA
4. Vérifiez que le contenu est généré correctement

## Avantages de l'intégration IA

✅ **Gain de temps** : Génération automatique de contenu  
✅ **Cohérence** : Style uniforme avec votre site  
✅ **Qualité** : Contenu professionnel et impactant  
✅ **Flexibilité** : Personnalisation possible après génération  
✅ **Évolutivité** : Facile d'ajouter de nouveaux services  

## Support

Pour toute question ou problème avec les blocs de service et l'IA :

1. Consultez les logs dans la console du navigateur
2. Vérifiez que l'API OpenAI est configurée
3. Testez avec les scripts de test fournis
4. Contactez l'équipe de développement si nécessaire

---

*Dernière mise à jour : Août 2024* 