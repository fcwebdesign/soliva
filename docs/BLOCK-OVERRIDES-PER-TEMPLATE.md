# Overrides de blocs par template (ex: ServiceSpotlight, Floating Gallery, etc.)

Quand tu veux changer la structure/rendu d’un bloc uniquement pour un template précis, sans casser les autres :

1) **Copie le composant du bloc dans le template**  
   - Exemple : `src/templates/mon-template/blocks/ServiceSpotlight.tsx` (copie depuis le bloc auto-déclaré et adapte la structure).

2) **Ajoute un override côté template**  
   - Dans le renderer du template (ou un petit registre local), mappe `block.type` vers ton composant custom :  
     - Si `block.type === 'service-spotlight'`, rends `ServiceSpotlight` du template.  
     - Sinon, utilise le bloc global auto-déclaré.
   - Le JSON de contenu ne change pas : seul le composant rendu varie pour ce template.

3) **CSS scoppé au template**  
   - Mets le CSS à côté : `src/templates/mon-template/blocks/ServiceSpotlight.css`.  
   - Scope avec la classe du template : `.template-mon-template .service-spotlight { ... }` pour éviter d’impacter les autres templates.  
   - Importe ce CSS dans ton composant override (ou dans un index CSS du template).

4) **Ce qui reste global**  
   - Les autres templates continuent d’utiliser le bloc auto-déclaré + son CSS global.  
   - Pas besoin de dupliquer l’éditeur : le formulaire auto-déclaré reste valable (même structure de données).

Checklist rapide  
- [ ] Copier le composant dans `src/templates/<template>/blocks/`  
- [ ] Ajouter la logique d’override dans le renderer du template  
- [ ] Créer le CSS scoppé `.template-<template> ...` et l’importer  
- [ ] Tester `/ ?template=<template>` pour valider l’override
