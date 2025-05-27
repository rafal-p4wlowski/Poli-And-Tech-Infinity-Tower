import { Redis } from '@upstash/redis';

// Klucz w Redis, pod którym będziemy przechowywać ranking (Sorted Set)
const LEADERBOARD_KEY = 'leaderboard';

// Lista dozwolonych domen (origin)
const allowedOrigins = [
    'https://poli-and-tech-it.pages.dev',    // Twoja domena Cloudflare Pages
    'https://rafal-p4wlowski.github.io',   // Twoja domena GitHub Pages
    // Dodaj tutaj adresy lokalne, jeśli testujesz, np.:
    // 'http://localhost:3000',
    // 'http://127.0.0.1:5500' // Częsty port dla Live Server w VS Code
];

export async function onRequestGet(context) { // Zmieniono z onRequest na onRequestGet dla jasności
  const origin = context.request.headers.get('Origin');
  const responseHeaders = {
      'Content-Type': 'application/json',
  };

  if (allowedOrigins.includes(origin)) {
      responseHeaders['Access-Control-Allow-Origin'] = origin;
      responseHeaders['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
      responseHeaders['Access-Control-Allow-Headers'] = 'Content-Type';
  }

  // Obsługa żądania OPTIONS (preflight)
  if (context.request.method === 'OPTIONS') {
      return new Response(null, { headers: responseHeaders, status: 204 });
  }

  // Jeśli to nie GET ani OPTIONS (choć nazwa funkcji sugeruje tylko GET)
  if (context.request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: responseHeaders
    });
  }

  try {
    const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = context.env;

    if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
      console.error('Brak zmiennych środowiskowych dla Upstash Redis.');
      return new Response(JSON.stringify({ error: 'Błąd konfiguracji serwera.' }), {
        status: 500,
        headers: responseHeaders, // Dodano responseHeaders
      });
    }

    const redis = new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    });

    const leaderboardData = await redis.zrange(LEADERBOARD_KEY, 0, 9, { rev: true, withScores: true });

    const leaderboard = [];
    for (let i = 0; i < leaderboardData.length; i += 2) {
      leaderboard.push({
        playerName: leaderboardData[i],
        score: parseInt(leaderboardData[i + 1], 10),
      });
    }

    return new Response(JSON.stringify(leaderboard), {
      headers: responseHeaders, // Dodano responseHeaders
      status: 200 // Jawne ustawienie statusu 200
    });

  } catch (error) {
    console.error('Błąd podczas pobierania rankingu z Upstash Redis:', error);
    return new Response(JSON.stringify({ error: 'Nie udało się pobrać rankingu.', details: error.message }), {
      status: 500,
      headers: responseHeaders, // Dodano responseHeaders
    });
  }
}