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

Skopiuj `.env.example` do `.env.local` i uzupełnij dane projektu Supabase.

## Wspólny projekt Supabase z QR Passport

Football Hub może bezpiecznie korzystać z istniejącego projektu QR Passport. Uruchom
`supabase/schema.sql` w SQL Editorze tego projektu. Wszystkie tabele i typy Football Hub
mają prefiks `fh_`, a zdjęcia trafiają do osobnych bucketów `football-avatars` oraz
`football-team-logos`. Migracja nie zmienia istniejących tabel QR Passport.

## Bezpieczeństwo

Repozytorium powinno być prywatne. Taktyki są dostępne wyłącznie dla zawodników, kapitana, sztabu i administratora. Kibice widzą tylko opublikowany skład.
