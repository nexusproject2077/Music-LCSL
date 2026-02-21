# VIBE – Premium Music Streaming Platform

Une plateforme de streaming musical premium inspirée de Spotify et Deezer, 100% gratuite.

## Fonctionnalités

- **Authentification** – Inscription / Connexion avec localStorage
- **Lecteur audio** – Play/Pause, Suivant/Précédent, barre de progression, volume
- **Mode aléatoire & Répétition** – Shuffle, repeat one, repeat all
- **Paroles** – Affichage en temps réel via Lyrics.ovh API
- **Like** – Aimer/unliker des titres
- **Playlists** – Créer, modifier, supprimer, ajouter/retirer des titres
- **Recherche** – Via iTunes Search API (gratuite, sans clé)
- **File d'attente** – Gestion de la file de lecture
- **Bibliothèque** – Playlists, titres aimés, albums, artistes suivis
- **Pages Artiste & Album** – Profils détaillés
- **Design premium** – Thème sombre élégant avec animations fluides
- **Raccourcis clavier** – Espace (play/pause), Alt+→/← (suivant/précédent), M (mute), Ctrl+K (recherche)

## Tech Stack

- HTML5 / CSS3 (Variables CSS, Grid, Flexbox, Animations)
- JavaScript vanilla (ES6+, modules)
- iTunes Search API – Musique réelle (aperçus 30s gratuits)
- Lyrics.ovh API – Paroles gratuites
- localStorage – Persistance des données utilisateur

## Structure

```
├── index.html
└── assets/
    ├── css/style.css
    └── js/
        ├── config.js    – Configuration & données genres
        ├── store.js     – localStorage (state persistant)
        ├── auth.js      – Authentification
        ├── api.js       – iTunes + Lyrics.ovh
        ├── player.js    – Lecteur audio HTML5
        ├── playlists.js – Gestion des playlists
        ├── views.js     – Rendus des pages + Lyrics
        ├── search.js    – Module recherche
        ├── ui.js        – UI helpers (toast, modals, menus)
        ├── router.js    – Navigation SPA
        └── app.js       – Point d'entrée
```
