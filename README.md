# Kenzo agency demo

Product site that walks an agency through Kenzo from two sides, narrated by Kenzo the mascot:

- `/tour/customer` — what the agency's customers experience (qualify → book → confirm → reminders)
- `/tour/agency` — what the agency sees (booking email → reminder with AI brief → dashboard)

Everything except the live agent step is **simulated on the front end**. No real emails, bookings or meetings are created from this site.

## Status

Skeleton only: routes, data-driven tour shell, responsive layout, placeholder scenes.

- [ ] Live agent step (`customer-agent`) — waits for the v5 API
- [ ] Animated scenes (GSAP)
- [ ] Design system tokens from Claude Design (current colours are placeholders)
- [ ] High-res transparent mascot art (current PNGs are low-res cutouts)
- [ ] Landing page

## Structure

```
src/lib/tour/tours.ts          step definitions (scene, mascot pose, narration)
src/components/tour/TourShell  layout, progress, navigation
src/components/tour/scenes     one scene per step (placeholders for now)
src/components/mascot          mascot poses
```

## Develop

```bash
npm install
npm run dev
```

Stack: Next.js (App Router), TypeScript, Tailwind, GSAP.
