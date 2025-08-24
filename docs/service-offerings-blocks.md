# Blocs de Service - Documentation

## Vue d'ensemble

Les blocs de service permettent d'afficher des offres de service avec un style "titre à gauche, description à droite", similaire à l'image de référence fournie.

## Types de blocs disponibles

### 1. `service-offering` (Bloc simple)

Affiche une seule offre de service.

**Structure des données :**
```javascript
{
  id: "unique-id",
  type: "service-offering",
  title: "Titre du service",
  description: "Description détaillée du service...",
  icon: "🏗️" // Optionnel
}
```

### 2. `service-offerings` (Groupe de services)

Affiche plusieurs offres de service groupées avec un titre de section.

**Structure des données :**
```javascript
{
  id: "unique-id",
  type: "service-offerings",
  title: "OUR CORE OFFERINGS", // Optionnel
  offerings: [
    {
      id: "service-1",
      title: "Commercial Excellence",
      description: "Description du service...",
      icon: "🏗️" // Optionnel
    },
    {
      id: "service-2",
      title: "Enterprise & Integration Architecture",
      description: "Description du service...",
      icon: "🔧" // Optionnel
    }
  ]
}
```

## Exemple d'utilisation

### Dans un fichier de contenu

```javascript
// Exemple avec un groupe de services
const content = {
  blocks: [
    {
      id: "services-section",
      type: "service-offerings",
      title: "NOS SERVICES PRINCIPAUX",
      offerings: [
        {
          id: "excellence-commerciale",
          title: "Excellence Commerciale",
          description: "Nous délivrons des services d'excellence commerciale sur mesure, basés sur la maturité, les capacités et les ambitions de votre organisation. Dans le contexte de ce qui est réalisable pour améliorer et implémenter, nous combinons des évaluations pratiques, des feuilles de route réalistes et des conceptions évolutives pour optimiser les processus, activer la technologie et obtenir des résultats mesurables."
        },
        {
          id: "architecture-entreprise",
          title: "Architecture d'Entreprise & Intégration",
          description: "Bien que Salesforce soit au cœur de ce que nous faisons, il fonctionne rarement de manière isolée. Nous concevons des stratégies d'intégration, des modèles de données robustes et des workflows pour assurer des opérations transparentes à travers des systèmes tels que SAP, Oracle et Microsoft.",
          icon: "🏗️"
        },
        {
          id: "conseil-salesforce",
          title: "Conseil Salesforce",
          description: "Nous offrons des services de conseil spécifiques à Salesforce adaptés aux besoins spécifiques dans le cadre d'un projet plus large ou de solutions autonomes. Nos spécialistes certifiés garantissent que les ambitions sont satisfaites avec l'évolutivité et le succès à long terme à l'esprit."
        }
      ]
    }
  ]
};
```

### Dans l'éditeur de blocs

Pour ajouter ces blocs via l'interface d'administration, vous devrez :

1. Ajouter les types `service-offering` et `service-offerings` à l'éditeur de blocs
2. Créer les formulaires correspondants pour la saisie des données
3. Intégrer ces blocs dans le système de rendu

## Styles CSS

Les blocs utilisent les classes CSS suivantes :

- `.service-offerings-section` : Conteneur principal du groupe
- `.service-offering-block` : Bloc individuel de service
- `.service-offering-block h3` : Titre du service
- `.service-offering-block p` : Description du service

## Responsive Design

Les blocs sont entièrement responsifs :
- Sur desktop : Titre à gauche (4 colonnes), description à droite (8 colonnes)
- Sur mobile : Titre au-dessus, description en dessous

## Animations

Les blocs incluent des animations d'apparition avec un délai progressif pour chaque élément. 