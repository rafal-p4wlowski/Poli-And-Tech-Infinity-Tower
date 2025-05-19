import { Redis } from '@upstash/redis';

const LEADERBOARD_KEY = 'leaderboard';

export async function onRequestPost(context) {
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

    let playerName, newScore; // Zmieniono nazwę score na newScore dla jasności
    try {
      const body = await context.request.json();
      playerName = body.playerName;
      newScore = body.score; // Zmieniono nazwę
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Nieprawidłowy format JSON w żądaniu.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (typeof playerName !== 'string') {
      return new Response(JSON.stringify({ error: 'Nazwa gracza musi być tekstem.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const trimmedPlayerName = playerName.trim();

    if (trimmedPlayerName.length < 3 || trimmedPlayerName.length > 15) {
      return new Response(JSON.stringify({ error: 'Nazwa gracza musi mieć od 3 do 15 znaków.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const validNamePattern = /^[a-zA-Z0-9 _ĄąĆćĘęŁłŃńÓóŚśŹźŻż-]+$/;
    if (!validNamePattern.test(trimmedPlayerName)) {
      return new Response(JSON.stringify({ error: 'Nazwa gracza zawiera niedozwolone znaki.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (typeof newScore !== 'number' || isNaN(newScore) || newScore < 0 || !Number.isInteger(newScore)) {
      return new Response(JSON.stringify({ error: 'Nieprawidłowy wynik. Musi być liczbą całkowitą, nieujemną.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- LOGIKA AKTUALIZACJI WYNIKU TYLKO JEŚLI LEPSZY ---
    const currentScoreInDb = await redis.zscore(LEADERBOARD_KEY, trimmedPlayerName);

    // currentScoreInDb będzie null jeśli gracz nie istnieje, lub stringiem z wynikiem jeśli istnieje
    const currentScore = currentScoreInDb !== null ? parseInt(currentScoreInDb, 10) : null;

    if (currentScore === null || newScore > currentScore) {
      // Gracz nie istnieje lub nowy wynik jest lepszy - zapisz/zaktualizuj
      await redis.zadd(LEADERBOARD_KEY, { score: newScore, member: trimmedPlayerName });
      return new Response(JSON.stringify({ message: 'Wynik zapisany pomyślnie!' }), {
        status: 201, // Created or Updated
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // Nowy wynik nie jest lepszy od istniejącego
      return new Response(JSON.stringify({ message: 'Nowy wynik nie jest lepszy od poprzedniego. Nie zaktualizowano.' }), {
        status: 200, // OK, ale bez modyfikacji
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // --- KONIEC LOGIKI AKTUALIZACJI ---

  } catch (error) {
    console.error('Błąd podczas zapisywania wyniku do Upstash Redis:', error);
    const clientErrorMessage = 'Nie udało się zapisać wyniku z powodu błędu serwera.';
    return new Response(JSON.stringify({ error: clientErrorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}