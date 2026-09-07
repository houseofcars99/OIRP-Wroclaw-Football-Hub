# OIRP Wrocław Football Hub

Mobilna aplikacja PWA dla drużyny OIRP Wrocław, sztabu i kibiców podczas mistrzostw świata prawników w piłce nożnej.

## Pierwszy etap

- panel kapitana z ustawieniem 6 zawodników na boisku;
- cztery gotowe formacje i ręczne przesuwanie zawodników;
- pięcioosobowa ławka rezerwowych;
- tryb roboczy i publikacja składu;
- bazowy schemat Supabase dla ról, drużyn, meczów, taktyk, komunikatów, typów i zdarzeń.

## Uruchomienie

```bash
npm install
npm run dev
```

Skopiuj `.env.example` do `.env.local` i uzupełnij dane osobnego projektu Supabase.

## Bezpieczeństwo

Repozytorium powinno być prywatne. Taktyki są dostępne wyłącznie dla zawodników, kapitana, sztabu i administratora. Kibice widzą tylko opublikowany skład.
