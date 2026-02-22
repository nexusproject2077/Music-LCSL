#!/usr/bin/env python3
"""
NexSon – Music Service
Search via ytmusicapi + Audio stream proxy via yt-dlp

Endpoints:
  GET /health
  GET /search?q=<term>&limit=25
  GET /stream?id=<videoId>        ← audio proxy (supports Range / seeking)
"""

import time
import threading
import traceback

from flask import Flask, jsonify, request, Response, stream_with_context
from flask_cors import CORS
from ytmusicapi import YTMusic
import yt_dlp
import requests as req_lib

app = Flask(__name__)
CORS(app)

# ── YouTube Music client (no auth needed for search) ─────────────────────────
yt = YTMusic()

# ── yt-dlp URL cache (stream URLs expire ~6h on YouTube) ─────────────────────
_url_cache: dict = {}
_cache_lock = threading.Lock()
CACHE_TTL = 3600  # 1 h


def _resolve_yt_url(video_id: str) -> str:
    """Return the direct audio stream URL for a YouTube video ID (cached)."""
    now = time.time()
    with _cache_lock:
        entry = _url_cache.get(video_id)
        if entry and entry['exp'] > now:
            return entry['url']

    ydl_opts = {
        'format': 'bestaudio[ext=webm]/bestaudio/best',
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
    }
    url = ''
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(
            f'https://www.youtube.com/watch?v={video_id}',
            download=False
        )
        url = info.get('url', '')
        if not url:
            fmts = [f for f in info.get('formats', [])
                    if f.get('vcodec') == 'none' and f.get('url')]
            url = fmts[-1]['url'] if fmts else ''

    if url:
        with _cache_lock:
            _url_cache[video_id] = {'url': url, 'exp': now + CACHE_TTL}

    return url


# ── Routes ───────────────────────────────────────────────────────────────────

@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'service': 'NexSon Music Service'})


@app.route('/search')
def search():
    q     = request.args.get('q', '').strip()
    limit = min(int(request.args.get('limit', 25)), 50)
    if not q:
        return jsonify([])

    try:
        results = yt.search(q, filter='songs', limit=limit)
        tracks  = []
        for t in results[:limit]:
            vid = t.get('videoId')
            if not vid:
                continue
            artists = t.get('artists') or []
            artist  = ', '.join(a['name'] for a in artists) if artists else 'Inconnu'
            album   = (t.get('album') or {}).get('name', '')
            thumbs  = t.get('thumbnails') or []
            art_big = thumbs[-1]['url'] if thumbs else ''
            art_sm  = thumbs[0]['url']  if thumbs else art_big
            tracks.append({
                'trackId':        f'yt_{vid}',
                'trackName':      t.get('title', 'Inconnu'),
                'artistName':     artist,
                'collectionName': album,
                'collectionId':   '',
                'artworkUrl':     art_big,
                'artworkSmall':   art_sm,
                'ytVideoId':      vid,       # used by frontend to build stream URL
                'duration':       t.get('duration_seconds', 0),
                'genre':          '',
                'releaseDate':    '',
                'trackNumber':    1,
                'artistId':       '',
                'source':         'youtube',
                'explicit':       bool(t.get('isExplicit', False)),
            })
        return jsonify(tracks)

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/stream')
def stream():
    """
    Proxy the audio stream for a YouTube video ID.
    Supports Range requests so seeking works in the browser <audio> element.
    """
    video_id = request.args.get('id', '').strip()
    if not video_id:
        return jsonify({'error': 'Missing id parameter'}), 400

    try:
        yt_url = _resolve_yt_url(video_id)
        if not yt_url:
            return jsonify({'error': 'Could not resolve stream URL'}), 404

        # Forward Range header from browser (enables seeking)
        fwd_headers = {
            'User-Agent': (
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                'AppleWebKit/537.36 (KHTML, like Gecko) '
                'Chrome/120.0.0.0 Safari/537.36'
            ),
        }
        if 'Range' in request.headers:
            fwd_headers['Range'] = request.headers['Range']

        r = req_lib.get(yt_url, headers=fwd_headers, stream=True, timeout=30)
        r.raise_for_status()

        resp_headers = {
            'Content-Type':  r.headers.get('Content-Type', 'audio/webm'),
            'Accept-Ranges': 'bytes',
        }
        for h in ('Content-Length', 'Content-Range'):
            if h in r.headers:
                resp_headers[h] = r.headers[h]

        def generate():
            for chunk in r.iter_content(chunk_size=16384):
                if chunk:
                    yield chunk

        return Response(
            stream_with_context(generate()),
            status=r.status_code,
            headers=resp_headers,
        )

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
