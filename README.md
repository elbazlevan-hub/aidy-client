# AIDY — Application web (React)

Interface de la plateforme AIDY : React 19 + React Router + Vite.
AIDY trouve les commerces qui ont besoin du service de l'utilisateur (pas de site, vieux site, réservation par WhatsApp…),
repère leur problème et écrit pour chacun un message personnalisé à envoyer en un clic.

Le serveur (Express + MongoDB) est dans un dépôt séparé : https://github.com/elbazlevan-hub/prospection-ia

## Lancer
1. Lancer d'abord le serveur : `npm start` dans son dossier
2. Dans ce dossier : `npm install` puis `npm run dev`
3. Ouvrir http://localhost:5173

Les appels `/api` sont redirigés vers le serveur (http://127.0.0.1:3000) par Vite : le cookie de connexion marche sans configuration.

## Écrans (React Router)
| Route | Écran |
|---|---|
| `/` | Accueil (présentation, langue) |
| `/login`, `/register` | Connexion, Inscription |
| `/today` | Aujourd'hui : plan du jour (relances + commerces à contacter) et argent gagné |
| `/offers` | Mes offres |
| `/offers/new`, `/offers/:id/edit` | Nouvelle offre (avec AIDY, un modèle ou le formulaire) / modifier |
| `/offers/:id` | Offre : bouton « Trouver mes clients » (recherche → analyse → déblocage), commerces prêts à contacter |
| `/leads/:id` | Fiche commerce : message, envoi en un clic (WhatsApp, email, Instagram), suivi, assistant de réponse |
| `/inbox` | À répondre : prospects qui ont répondu, les plus urgents d'abord |
| `/stats` | Résultats : argent, taux de réponse par canal et par problème |
| `/packs` | Packs de crédits (Standard 29 €, Premium 49 €, Recharge 17 €), paiement de démonstration, historique |
| `/settings` | Réglages : langue, fiche infos du vendeur, liste « ne plus contacter » |
| `*` | Page 404 |

Les pages après connexion sont protégées (`ProtectedRoute`) et partagent la même structure (`Layout`).

## Technique
- `useState`, `useEffect`, `useContext` : `AuthContext` (utilisateur connecté, crédits), `I18nContext` (langue)
- Hook maison `useApi(path)` : `{ data, loading, error, reload }`
- Langues : français, anglais, espagnol (`src/i18n`)
- Validation des formulaires côté client (`src/utils/validate.js`) : email, mot de passe fort, emails jetables refusés, URLs, prix… Le serveur revérifie tout avec Zod
- États de chargement, d'erreur et listes vides sur chaque écran (`components/States.jsx`)
- Responsive : menu à gauche sur ordinateur, en bas sur téléphone
- Logo et favicon : `public/logo.png`, `public/favicon.png`
