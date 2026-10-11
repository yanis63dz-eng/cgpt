# Manveo

Page produit responsive en suédois, reconstruite en React à partir du PDF fourni de la page Knitla. Identité Manveo, visuels originaux dans une palette noir, crème, bois, sauge et terre cuite. Aucun avis client ni visage humain.

## Démarrer

Node.js 22.12+ ou 24 et npm.

```sh
cd /workspace/cgpt
npm ci
npm run dev -- --port 5173
```

```sh
npm run build
npm run preview -- --port 4173
npm test
```

Les tests ouvrent Chromium, démarrent leur propre serveur de prévisualisation et le ferment à la fin. Exécuter `npm run build` avant `npm test`. Par défaut Chromium est recherché à `/usr/bin/chromium`; utiliser `CHROMIUM_PATH` pour une autre installation. Les captures sont enregistrées dans `test-results/`.

## Fonctionnalités

- Galerie de six compositions : vignettes, flèches, clavier, balayage tactile et agrandissement.
- Lots de 1, 2 ou 3 kits : 349, 499 et 699 SEK. Fils supplémentaires à 99 SEK.
- Panier local persistant, quantités, suppression, calcul du total et bouton d’ajout fixe.
- Deux carrousels éditoriaux de quatre cartes chacun : boutons, indicateurs, navigation clavier et défilement tactile natif.
- Avant/après, tutoriel en quatre étapes, contenu du kit, garantie de 30 jours et six questions FAQ.
- Menu mobile, fenêtres d’information, navigation accessible au clavier, mouvement réduit.
- Images et polices servies localement, sans dépendance au site d’origine.

## Fidélité à la source et points restant à vérifier

L’accès direct à `https://knitla.se/products/knitla` a renvoyé un refus du proxy réseau (HTTP 403). La source accessible est le PDF de 23 pages, une capture mobile statique.

La structure, les textes visibles des sections, les trois offres, les questions FAQ et les quatre étapes sont repris du PDF avec remplacement de la marque. Tous les visuels ont été recréés. Les témoignages isolés, étoiles et la section avis ont été retirés.

**L’intégralité exacte des carrousels d’origine ne peut pas être certifiée avec cette seule capture.** Le nombre réel de diapositives et le contenu des diapositives masquées ne sont pas disponibles. La galerie reprend six thèmes identifiables sur les vignettes. Les carrousels « Laga. Skapa. Förnya. » et « Bevara mer » contiennent chacun quatre cartes fonctionnelles, avec du contenu adapté pour les parties non visibles. Les réponses FAQ étaient fermées dans la capture : leurs textes sont également adaptés. Les légendes de galerie partiellement illisibles sont reformulées. Ne pas présenter ces éléments comme des transcriptions vérifiées du site complet.

Pour terminer la vérification fidèle : autoriser `knitla.se` dans l’environnement, ou fournir l’export HTML et les médias de la page, puis comparer toutes les diapositives et réponses. Le domaine a été ajouté au brouillon des paramètres réseau, sans publication automatique.

Le PDF ne montre pas la mise en page desktop : celle-ci est une adaptation responsive. Les coordonnées légales de l’entreprise d’origine ne sont pas attribuées à Manveo. Les pages de politiques, coordonnées commerciales, prix promotionnels et annonces de paiement doivent être validés avec les informations réelles de Manveo avant commercialisation.

## Paiement et intégration boutique

Le panier est fonctionnel côté navigateur. Aucune commande ni transaction n’est créée par défaut. Un message explicite apparaît si l’on tente d’ouvrir une caisse non configurée.

Configurer `VITE_CHECKOUT_ENDPOINT` (voir `.env.example`) avec un backend de paiement qui accepte les identifiants `kit-1`, `kit-2`, `kit-3`, `threads` et des quantités entières. Le serveur doit recalculer les prix à partir de son propre catalogue et retourner une URL HTTPS de session de paiement. Les logos de paiement sont des éléments visuels de la maquette ; ils ne prouvent aucune intégration. Aucun secret ne doit être placé dans une variable `VITE_`.

## Fichiers

- `src/main.jsx` : composants et interactions.
- `src/data.js` : textes, offres et cartes de carrousel.
- `src/styles.css` : mise en page desktop/mobile.
- `public/images/` : nouveaux visuels Manveo. Les planches de quatre photos sont affichées individuellement par cadrage CSS.
- `tests/storefront.mjs` : parcours fonctionnels sur la version de production.

Utiliser le checkout existant : chaque tâche cloud dispose déjà d’un environnement isolé. Aucun worktree supplémentaire n’est nécessaire.
