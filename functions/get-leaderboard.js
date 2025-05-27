import { Redis } from '@upstash/redis';

const LEADERBOARD_KEY = 'leaderboard';

const allowedOrigins = [
    'https://poli-and-tech-it.pages.dev',
    'https://rafal-p4wlowski.github.io',
];

export async function onRequestOptions(context) {
  const origin = context.request.headers.get('Origin');
  const responseHeaders = {};

  if (allowedOrigins.includes(origin)) {
      responseHeaders['Access-Control-Allow-Origin'] = origin;
      responseHeaders['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
      responseHeaders['Access-Control-Allow-Headers'] = 'Content-Type';
  }
  return new Response(null, { headers: responseHeaders, status: 204 });
}

export async function onRequestGet(context) {
  const origin = context.request.headers.get('Origin');
  const responseHeaders = {
      'Content-Type': 'application/json',
  };

  if (allowedOrigins.includes(origin)) {
      responseHeaders['Access-Control-Allow-Origin'] = origin;
  }

  try {
    const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = context.env;

    if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
      console.error('Brak zmiennych środowiskowych dla Upstash Redis.');
      return new Response(JSON.stringify({ error: 'Błąd konfiguracji serwera.' }), {
        status: 500,
        headers: responseHeaders,
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
      status: 200,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Błąd podczas pobierania rankingu z Upstash Redis:', error);
    return new Response(JSON.stringify({ error: 'Nie udało się pobrać rankingu.', details: error.message }), {
      status: 500,
      headers: responseHeaders,
    });
  }
}