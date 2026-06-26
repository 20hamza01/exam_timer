# Exam Timer

A mobile-first web app that helps you pace yourself during a timed exam. You enter
the number of questions and the total duration; the app runs a **per-question
countdown** so you always know whether you're ahead or behind.

## The pacing model (the heart of the app)

Each question's countdown is **recomputed when that question starts**:

```
allowanceForThisQuestion = remainingTotalTime / remainingQuestions
```

- 90 questions / 90 min → first question gets `90min / 90 = 60s`.
- Finish a question early → the saved time is banked and the next allowance ticks up
  (you're ahead).
- Go over → the countdown crosses zero, turns **red**, and the next allowance shrinks
  (you need to speed up).

This matches the natural intuition: "I answered Q1 in 20s, so I now have 89:40 left for
the remaining 89 questions."

All timing is **timestamp-based** (`Date.now()` deltas), never accumulated from interval
ticks, so it never drifts even if the tab is throttled. A 200ms interval only forces
re-renders; every displayed value is derived from stored timestamps each render.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- 100% client-side — no backend, no database, no persistence. Designed to deploy to
  **Vercel** as a static/SSR app with zero config.

## Project structure

```
app/
  layout.tsx              Root layout, metadata, mobile viewport, dark theme
  globals.css             Tailwind import + safe-area padding + font wiring
  page.tsx                Top-level state machine: setup | running | summary
  hooks/
    useExamTimer.ts       ALL timing logic & state machine (start/next/pause/resume/reset)
  components/
    SetupForm.tsx         Inputs: # questions + hours/minutes, validation, "≈ Xs/question"
    TimerView.tsx         Running view: per-question countdown, total left, progress, controls
    SummaryView.tsx       End screen: time used/allotted, avg, fastest, slowest
  lib/
    format.ts             formatClock() (MM:SS / H:MM:SS, signed) and formatDuration()
```

The single source of truth is `useExamTimer`. Components are presentational and receive
the `ExamTimer` object (or just `onStart`) as props.

## Phases

1. **setup** — collect questions + duration, validate, call `start(n, totalMs)`.
2. **running** — primary per-question countdown (green → amber under 25% → red when over),
   secondary total-time-remaining, progress bar, **Next** (banks time + recomputes),
   **Pause/Resume**, **Reset**. Auto-ends on the last **Next** or when total time hits 0.
3. **summary** — stats + **New exam** (calls `reset`).

## Commands

```bash
npm run dev      # local dev server at http://localhost:3000
npm run build    # production build (run before deploying)
npm run start    # serve the production build
npm run lint     # eslint
```

## Deploying to Vercel

Push to a Git repo and import it in Vercel, or run `vercel` from this directory. No
environment variables or build settings are needed — the defaults work.

## Conventions

- Keep the timer logic in `useExamTimer`; don't scatter `Date.now()` math into components.
- Durations are **milliseconds** everywhere except UI input (minutes/hours) and `format.ts`
  output.
- Components are client components (`"use client"`) because the whole app is interactive.
