# Timeline Map

## How Timeline Units Work

GSAP timeline positions (the second argument to `tl.to(el, opts, POSITION)`) are in arbitrary units where **1 unit ≈ one viewport-height of scroll distance**, given the scrub ratio.

The total scroll budget is set by `end: '+=1250%'` in vanilla (≈12.5 units) and `end: '+=500%'` in the React version (the React version currently only implements S1–S3).

Adding an animation does not automatically push downstream animations — you must manually adjust all subsequent position values if you need to insert time.

---

## Intro Stage Timeline (`.intro-stage`)

This is the single unified `tl` driven by the one pinned ScrollTrigger on `.intro-stage`.

```
Position    Duration    What happens
────────────────────────────────────────────────────────────────
0.0 → 1.0   1.0         Stage 1 chars blur OUT  (stagger 0.04)
0.5 → 1.5   1.0         Stage 2 chars blur IN   (stagger 0.04)   ← overlaps S1 exit
             ↑ 1.5–3.8  Dead scroll hold — user reads S2 text
3.8 → 4.8   1.0         Stage 2 chars blur OUT  (stagger 0.04)
4.1 → 4.5   0.4         S1/S2 overlay fades to opacity 0
4.3 → 5.3   1.0         Stage 3 element blurs IN (whole element, not chars)
4.5 → 5.5   1.0         Glare PNG + Spark SVG scale 0→1, fade in
             ↑ 5.3–6.5  Dead scroll hold — user reads "That's 1 day with DBS"
6.5 → 10.5  4.0         Counter ticks 1 → 1825
6.5 → 10.5  4.0         Glare shrinks  (scale → 120/766)
6.5 → 10.5  4.0         Spark shrinks  (scale → 120/375)
7.0 → 10.5  3.5         Galaxy bg layer fades in + scale zooms to cover
7.2 → 10.5  3.3         Galaxy far layer fades in + scale zooms
7.4 → 10.5  3.1         Galaxy mid layer fades in + scale zooms
7.6 → 10.5  2.9         Galaxy near layer fades in + scale zooms
            ↑ 10.5–11.0 Dead scroll hold — user experiences full galaxy
11.0 → 12.0 1.0         Galaxy layers + glare + spark fade to opacity 0
11.0 → 11.8 0.8         Stage 3 text fades out + blurs
            ↑ 12.0–12.5 Hold on black before pin releases
```

**Total intro-stage scroll budget: ~12.5 units**

---

## Section 4 (`.section-4`)

```
0.0 → 1.0   Count + subtitle blur in
0.8 → 2.8   9 testimonial cards stagger in (perspective fly-through)
2.8 → 4.0   Dead hold
```

---

## Section 6 — Medal (`.section-6`)

Medal spin-in and 3D rotation. See vanilla.html around line 762 for exact positions.

---

## Section 7 — Letter (`.section-7`)

"Write a letter" prompt reveal. See vanilla.html around line 801.

---

## Rules When Editing the Timeline

1. **Inserting a new beat:** add it at an unused position and leave existing entries unchanged, unless you need to shift hold durations — then update all downstream positions manually.
2. **Changing a duration:** does not affect other entries (they use absolute positions, not relative). But it may cause visual overlap or gap — check surrounding entries.
3. **The counter ticks from 1 to 1825 over 4.0 units starting at 6.5.** If you change the milestone (e.g. 3 years = 1095 days), update `COUNTER_TO` in `App.tsx` and `val: 1825` in vanilla, and update `TOTAL_STARS` in `StarField.tsx` to match.
