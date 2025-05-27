import { Redis } from '@upstash/redis';

const LEADERBOARD_KEY = 'leaderboard';

// Lista dozwolonych domen (origin)
const allowedOrigins = [
    'https://poli-and-tech-it.pages.dev',
    'https://rafal-p4wlowski.github.io',
];

export async function onRequestPost(context) {
  const origin = context.request.headers.get('Origin');
  const responseHeaders = {
      'Content-Type': 'application/json',
  };

  if (allowedOrigins.includes(origin)) {
      responseHeaders['Access-Control-Allow-Origin'] = origin;
      responseHeaders['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
      responseHeaders['Access-Control-Allow-Headers'] = 'Content-Type';
  }

  // Obsługa żądania OPTIONS
  if (context.request.method === 'OPTIONS') {
      return new Response(null, { headers: responseHeaders, status: 204 });
  }

  if (context.request.method !== 'POST') {
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
        headers: responseHeaders,
      });
    }

    const redis = new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    });

    let playerName, newScore;
    try {
      const body = await context.request.json();
      playerName = body.playerName;
      newScore = body.score;
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Nieprawidłowy format JSON w żądaniu.' }), {
        status: 400,
        headers: responseHeaders,
      });
    }

    if (typeof playerName !== 'string') {
      return new Response(JSON.stringify({ error: 'Nazwa gracza musi być tekstem.' }), {
        status: 400,
        headers: responseHeaders,
      });
    }

    const trimmedPlayerName = playerName.trim();

    // Połączona walidacja długości i znaków
    const validNamePattern = /^[a-zA-Z0-9 _ĄąĆćĘęŁłŃńÓóŚśŹźŻż-]+$/;
    if (trimmedPlayerName.length < 3 || trimmedPlayerName.length > 15 || !validNamePattern.test(trimmedPlayerName)) {
        let errorDetail = 'Nazwa gracza musi mieć od 3 do 15 znaków i może zawierać tylko litery, cyfry, spacje, podkreślenia, myślniki oraz polskie znaki.';
        if (trimmedPlayerName.length < 3 || trimmedPlayerName.length > 15) {
            errorDetail = 'Nazwa gracza musi mieć od 3 do 15 znaków.';
        } else if (!validNamePattern.test(trimmedPlayerName)) {
            errorDetail = 'Nazwa gracza zawiera niedozwolone znaki.';
        }
        return new Response(JSON.stringify({ error: errorDetail }), {
            status: 400,
            headers: responseHeaders,
        });
    }
    
    if (typeof newScore !== 'number' || isNaN(newScore) || newScore < 0 || !Number.isInteger(newScore)) {
      return new Response(JSON.stringify({ error: 'Nieprawidłowy wynik. Musi być liczbą całkowitą, nieujemną.' }), {
        status: 400,
        headers: responseHeaders,
      });
    }

    const currentScoreInDb = await redis.zscore(LEADERBOARD_KEY, trimmedPlayerName);
    const currentScore = currentScoreInDb !== null ? parseInt(currentScoreInDb, 10) : null;

    if (currentScore === null || newScore > currentScore) {
      await redis.zadd(LEADERBOARD_KEY, { score: newScore, member: trimmedPlayerName });
      return new Response(JSON.stringify({ message: 'Wynik zapisany pomyślnie!' }), {
        status: 201,
        headers: responseHeaders,
      });
    } else {
      return new Response(JSON.stringify({ message: 'Nowy wynik nie jest lepszy od poprzedniego. Nie zaktualizowano.' }), {
        status: 200,
        headers: responseHeaders,
      });
    }

  } catch (error) {
    console.error('Błąd podczas zapisywania wyniku do Upstash Redis:', error);
    const clientErrorMessage = 'Nie udało się zapisać wyniku z powodu błędu serwera.';

    return new Response(JSON.stringify({ error: clientErrorMessage, details: error.message }), {
      status: 500,
      headers: responseHeaders,
    });
  }
}