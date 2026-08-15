# Bought Nearby

**Rank what you buy. Discover the local stores worth walking to.**

NYC has ~32,000 retail stores. 24,000 of them are independents with no
meaningful way to be discovered — outsold in visibility by chains and fast
fashion that can afford to buy attention.

Bought Nearby is a Beli-style app for purchases. You log what you bought and
where, then rank it against things you already own through quick head-to-head
comparisons. No star ratings, no writing reviews.

The part that matters: **every purchase you rank is a vote for the store you
bought it from.** Item rankings roll up into store scores, and the map shows
local NYC stores ranked by how much people actually ended up loving what they
bought there.

That's a signal that doesn't exist anywhere today. Google reviews are
pre-purchase sentiment from strangers. This is post-purchase revealed
preference from people you follow — and it only works at NYC's retail density.

## Stack

Vite · React · TypeScript · Tailwind · Leaflet (OpenStreetMap) · localStorage

Mobile-first PWA. No backend, no accounts — data lives on-device.

## Develop

```bash
npm install
npm run dev -- --host   # --host exposes on your LAN so you can open it on a phone
npm test                # ranking engine unit tests
npm run build
```

Test on a real phone early. Mobile Safari's camera input and Leaflet's touch
handling both differ from desktop.
