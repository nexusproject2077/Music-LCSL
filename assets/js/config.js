/* ============================================
   VIBE – Config & Demo Data
   ============================================ */

const CONFIG = {
  APP_NAME: 'VIBE',
  VERSION:  '1.0.0',
  // iTunes Search API (no key needed, CORS-ok from HTTPS)
  ITUNES_API: 'https://itunes.apple.com/search',
  // Lyrics API
  LYRICS_API: 'https://api.lyrics.ovh/v1',
  // Jamendo (free music, full streams) — register free at developer.jamendo.com
  JAMENDO_API: 'https://api.jamendo.com/v3.0',
  JAMENDO_KEY: 'b6747d04',
};

/* ─── Genre Data ─── */
const GENRES = [
  { id: 'pop',        name: 'Pop',         color: '#e91e8c', emoji: '🎤' },
  { id: 'rap',        name: 'Rap / Hip-Hop', color: '#ff6b35', emoji: '🎤' },
  { id: 'rnb',        name: 'R&B / Soul',  color: '#9c27b0', emoji: '🎵' },
  { id: 'rock',       name: 'Rock',        color: '#d32f2f', emoji: '🎸' },
  { id: 'electronic', name: 'Électronique', color: '#1565c0', emoji: '🎛️' },
  { id: 'jazz',       name: 'Jazz',        color: '#e65100', emoji: '🎷' },
  { id: 'classical',  name: 'Classique',   color: '#1b5e20', emoji: '🎻' },
  { id: 'latin',      name: 'Latino',      color: '#f57f17', emoji: '💃' },
  { id: 'afro',       name: 'Afrobeats',   color: '#33691e', emoji: '🥁' },
  { id: 'reggae',     name: 'Reggae',      color: '#2e7d32', emoji: '🌿' },
  { id: 'country',    name: 'Country',     color: '#795548', emoji: '🤠' },
  { id: 'kpop',       name: 'K-Pop',       color: '#ad1457', emoji: '⭐' },
];

/* ─── Demo Playlists (system) ─── */
const SYSTEM_PLAYLISTS = [
  { id: 'top-hits',    name: 'Top Hits 2025',     query: 'top hits 2025',     tag: 'Éditorial' },
  { id: 'chill-vibes', name: 'Chill Vibes',        query: 'lofi chill',        tag: 'Ambiance' },
  { id: 'workout',     name: 'Workout Pump',       query: 'workout pump',      tag: 'Énergie' },
  { id: 'late-night',  name: 'Late Night Drive',   query: 'late night music',  tag: 'Nocturne' },
  { id: 'afro',        name: 'Afrobeats Party',    query: 'afrobeats',         tag: 'Danse' },
  { id: 'rap-fr',      name: 'Rap Français',       query: 'rap francais',      tag: 'France' },
];

/* ─── Featured Artists (searched dynamically) ─── */
const FEATURED_ARTISTS = [
  'Drake', 'Beyoncé', 'The Weeknd', 'Taylor Swift',
  'Doja Cat', 'Bad Bunny', 'Burna Boy', 'Aya Nakamura',
];

/* ─── Color Palettes for Playlists ─── */
const PLAYLIST_COLORS = [
  ['#7c3aed', '#ec4899'],
  ['#2563eb', '#7c3aed'],
  ['#d97706', '#ef4444'],
  ['#059669', '#3b82f6'],
  ['#dc2626', '#9333ea'],
  ['#0891b2', '#10b981'],
  ['#be185d', '#f97316'],
  ['#7c3aed', '#3b82f6'],
];
