import { Redis } from '@upstash/redis';

// Klucz w Redis, pod którym będziemy przechowywać ranking (Sorted Set)
const LEADERBOARD_KEY = 'leaderboard';

export async function onRequestGet(context) {
  try {
    const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = context.env;

    if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
      console.error('Brak zmiennych środowiskowych dla Upstash Redis.');
      return new Response(JSON.stringify({ error: 'Błąd konfiguracji serwera.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const redis = new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    });

    // Pobierz top 10 graczy z wynikami (od najwyższego do najniższego)
    // ZRANGE LEADERBOARD_KEY 0 9 REV WITHSCORES
    const leaderboardData = await redis.zrange(LEADERBOARD_KEY, 0, 9, { rev: true, withScores: true });

    const leaderboard = [];
    for (let i = 0; i < leaderboardData.length; i += 2) {
      leaderboard.push({
        playerName: leaderboardData[i], // Nazwa gracza
        score: parseInt(leaderboardData[i + 1], 10), // Wynik
      });
    }

    return new Response(JSON.stringify(leaderboard), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Błąd podczas pobierania rankingu z Upstash Redis:', error);
    return new Response(JSON.stringify({ error: 'Nie udało się pobrać rankingu.', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}