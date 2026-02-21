/* ============================================
   VIBE – API Module
   iTunes Search API + Lyrics.ovh
   ============================================ */

const API = {
  _cache: {},

  /* ── Normalize a track from iTunes response ── */
  _normalizeTrack(t) {
    return {
      trackId:        t.trackId || t.trackCensoredName,
      trackName:      t.trackName || t.trackCensoredName || 'Inconnu',
      artistName:     t.artistName || 'Artiste inconnu',
      collectionName: t.collectionName || '',
      collectionId:   t.collectionId,
      artworkUrl:     (t.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
      artworkSmall:   t.artworkUrl100 || '',
      previewUrl:     t.previewUrl || null,
      duration:       t.trackTimeMillis ? Math.round(t.trackTimeMillis / 1000) : 30,
      genre:          t.primaryGenreName || '',
      releaseDate:    t.releaseDate || '',
      trackNumber:    t.trackNumber || 1,
      artistId:       t.artistId,
      country:        t.country || '',
      explicit:       t.trackExplicitness === 'explicit',
    };
  },

  /* ── iTunes search ── */
  async search(term, limit = 25, media = 'music', entity = 'song') {
    const cacheKey = `search_${term}_${limit}`;
    if (this._cache[cacheKey]) return this._cache[cacheKey];

    try {
      const url = `${CONFIG.ITUNES_API}?term=${encodeURIComponent(term)}&media=${media}&entity=${entity}&limit=${limit}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('API error');
      const data = await resp.json();
      const results = (data.results || []).map(t => this._normalizeTrack(t));
      this._cache[cacheKey] = results;
      return results;
    } catch (e) {
      console.error('iTunes search error:', e);
      return [];
    }
  },

  /* ── Search songs ── */
  async searchSongs(term, limit = 25) {
    return this.search(term, limit, 'music', 'song');
  },

  /* ── Search artists ── */
  async searchArtists(term, limit = 10) {
    const cacheKey = `artists_${term}`;
    if (this._cache[cacheKey]) return this._cache[cacheKey];
    try {
      const url = `${CONFIG.ITUNES_API}?term=${encodeURIComponent(term)}&media=music&entity=musicArtist&limit=${limit}`;
      const resp = await fetch(url);
      const data = await resp.json();
      const results = (data.results || []).map(a => ({
        artistId:   a.artistId,
        artistName: a.artistName,
        genre:      a.primaryGenreName || '',
        artistUrl:  a.artistLinkUrl || '',
        artworkUrl: `https://source.unsplash.com/300x300/?${encodeURIComponent(a.artistName)},musician,concert`,
      }));
      this._cache[cacheKey] = results;
      return results;
    } catch (e) { return []; }
  },

  /* ── Search albums ── */
  async searchAlbums(term, limit = 10) {
    const cacheKey = `albums_${term}`;
    if (this._cache[cacheKey]) return this._cache[cacheKey];
    try {
      const url = `${CONFIG.ITUNES_API}?term=${encodeURIComponent(term)}&media=music&entity=album&limit=${limit}`;
      const resp = await fetch(url);
      const data = await resp.json();
      const results = (data.results || []).map(a => ({
        collectionId:   a.collectionId,
        collectionName: a.collectionName,
        artistName:     a.artistName,
        artworkUrl:     (a.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
        artworkSmall:   a.artworkUrl100 || '',
        trackCount:     a.trackCount,
        releaseDate:    a.releaseDate,
        genre:          a.primaryGenreName || '',
        artistId:       a.artistId,
      }));
      this._cache[cacheKey] = results;
      return results;
    } catch (e) { return []; }
  },

  /* ── Get album tracks ── */
  async getAlbumTracks(collectionId) {
    const cacheKey = `album_${collectionId}`;
    if (this._cache[cacheKey]) return this._cache[cacheKey];
    try {
      const url = `${CONFIG.ITUNES_API}?id=${collectionId}&media=music&entity=song`;
      const resp = await fetch(url);
      const data = await resp.json();
      const results = (data.results || [])
        .filter(t => t.wrapperType === 'track')
        .map(t => this._normalizeTrack(t));
      this._cache[cacheKey] = results;
      return results;
    } catch (e) { return []; }
  },

  /* ── Get artist top tracks ── */
  async getArtistTopTracks(artistId, limit = 20) {
    const cacheKey = `artist_top_${artistId}`;
    if (this._cache[cacheKey]) return this._cache[cacheKey];
    try {
      const url = `${CONFIG.ITUNES_API}?id=${artistId}&media=music&entity=song&limit=${limit}`;
      const resp = await fetch(url);
      const data = await resp.json();
      const results = (data.results || [])
        .filter(t => t.wrapperType === 'track')
        .map(t => this._normalizeTrack(t));
      this._cache[cacheKey] = results;
      return results;
    } catch (e) { return []; }
  },

  /* ── Get artist albums ── */
  async getArtistAlbums(artistId, limit = 10) {
    const cacheKey = `artist_albums_${artistId}`;
    if (this._cache[cacheKey]) return this._cache[cacheKey];
    try {
      const url = `${CONFIG.ITUNES_API}?id=${artistId}&media=music&entity=album&limit=${limit}`;
      const resp = await fetch(url);
      const data = await resp.json();
      const results = (data.results || [])
        .filter(t => t.wrapperType === 'collection')
        .map(a => ({
          collectionId:   a.collectionId,
          collectionName: a.collectionName,
          artistName:     a.artistName,
          artworkUrl:     (a.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
          artworkSmall:   a.artworkUrl100 || '',
          trackCount:     a.trackCount,
          releaseDate:    a.releaseDate,
          genre:          a.primaryGenreName || '',
        }));
      this._cache[cacheKey] = results;
      return results;
    } catch (e) { return []; }
  },

  /* ── Get genre tracks ── */
  async getGenreTracks(genre, limit = 25) {
    return this.searchSongs(genre, limit);
  },

  /* ── Get lyrics ── */
  async getLyrics(artist, title) {
    const cacheKey = `lyrics_${artist}_${title}`;
    if (this._cache[cacheKey] !== undefined) return this._cache[cacheKey];
    try {
      const url = `${CONFIG.LYRICS_API}/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
      const resp = await fetch(url);
      if (!resp.ok) { this._cache[cacheKey] = null; return null; }
      const data = await resp.json();
      const lyrics = data.lyrics || null;
      this._cache[cacheKey] = lyrics;
      return lyrics;
    } catch (e) { this._cache[cacheKey] = null; return null; }
  },

  /* ── Clear cache ── */
  clearCache() { this._cache = {}; },

  /* ── Format duration ── */
  formatDuration(seconds) {
    if (!seconds) return '0:30';
    const m = Math.floor(seconds / 60);
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  },
};
