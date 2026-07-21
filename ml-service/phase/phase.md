# ATLAS — Phase 7: Polish & Demo Readiness

## What changed in this phase

1. **Accessibility fix (real, measured)** — `--atlas-text-tertiary` (used for
   timestamps, labels, and secondary text throughout the app) was measured
   at a 3.62:1 contrast ratio against the background — below the WCAG AA
   minimum of 4.5:1 for normal text. Updated from `#5e6b7a` to `#8b96a3`,
   now at 6.56:1. Single CSS variable change, applies everywhere.
2. **Skip-to-content link** — keyboard and screen-reader users can now
   press Tab once on page load to jump straight past the sidebar into
   main content.
3. **Digital Twin mobile fix** — added a minimum height to the plant
   canvas so asset icons don't become illegibly cramped on narrow screens.
4. **Real Settings page** — replaced the placeholder with account info,
   live status for all three services (ML microservice, backend,
   Firebase), and sign-out. Every module is now fully live — no more
   "arrives in Phase X" placeholders anywhere in the app.

## Pre-demo QA checklist

Run through this with all three services running
(`ml-service` on :8000, `backend` on :4000, `atlas-frontend` on :5173):

- [ ] Sign in with Google works, lands on Overview
- [ ] Overview KPIs are changing slightly every ~2 seconds (ambient sensor noise)
- [ ] Trigger Pump-17 scenario from Overview — alerts start appearing
- [ ] Switch to Digital Twin mid-scenario — Pump-17's icon shows amber/red
      with pulsing ring, Zone C tinted to match
- [ ] Switch to Predictive Engine — ML risk classification and RUL
      prediction for Pump-17 are updating, "Connected" status showing
- [ ] Switch to AI Council once scenario hits critical — council
      auto-reconvenes with fresh findings, no click needed
- [ ] Switch to Emergency Response — red "EMERGENCY MODE ACTIVE" banner
      visible, Risk Heatmap shows Zone C in red
- [ ] Click "Shut Down Pump-17" from Overview — watch metrics recover
      over ~10-15 seconds, "Incident averted" alert appears
- [ ] Click Reset — everything returns to nominal, ready to re-run
- [ ] Knowledge Center: upload a small .txt file, confirm it appears in
      the Documents list with a chunk count
- [ ] Ask a question about the uploaded document — get an answer with
      a Sources section showing filename + match %
- [ ] Settings page shows all three services as "Connected"
- [ ] Resize browser to phone width — sidebar collapses to hamburger,
      no layout breaking on any page
- [ ] Sign out works, returns to login screen

## Before final submission (not needed for a live demo, but for judging polish)

- [ ] In `backend/.env`, set `REQUIRE_AUTH=true` and add your Firebase
      service account file (see `backend/README.md` step 7) — do this
      **after** you're confident everything else works, since it adds a
      failure point
- [ ] Do one full run-through with `REQUIRE_AUTH=true` to confirm sign-in
      still flows correctly end-to-end
- [ ] Clear/reset the simulation once before judges see it, so the demo
      starts from a clean nominal state

## Demo script (aim for 4-5 minutes)

**1. Open on Overview (30 sec)**
> "This is ATLAS — an industrial safety intelligence platform. Everything
> you're seeing is live — sensor data updating every two seconds from a
> simulation engine, not static mock data."

Point at the KPI cards shifting slightly.

**2. Trigger the scenario (30 sec)**
> "Let's watch it catch a real problem. I'm going to trigger a pump
> failure scenario — Pump-17 starts overheating due to overdue
> maintenance."

Click **Trigger Pump-17 Scenario**. Point at the progress bar and first
alert appearing.

**3. Digital Twin (45 sec)**
> "Here's the plant, live. Pump-17 —" *(point, click it)* "— you can see
> its health score dropping in real time, actual sensor readings, and
> which workers are nearby."

**4. Predictive Engine (45 sec)**
> "This isn't just a threshold alarm — there's a real trained ML
> pipeline underneath. Three separate scikit-learn models: a regressor
> predicting remaining useful life, a classifier for risk category, and
> an anomaly detector trained only on normal operating data. You can see
> the model's prediction next to the rule-based engine's own estimate."

**5. AI Council (45 sec)**
> "Once risk crosses a threshold, six domain-expert agents reason
> independently — mechanical, chemical, safety, maintenance, compliance,
> emergency response — then reach a consensus recommendation with a
> confidence score."

Point out it auto-convened without a click.

**6. Emergency Response (30 sec)**
> "The response orchestrator ties it together — heatmap, evacuation
> guidance, assembly points, and a live response timeline of everything
> that's happened."

**7. Resolve it (20 sec)**
> "And critically — ATLAS doesn't just alert, it helps prevent the
> incident."

Click **Shut Down Pump-17**, watch it recover.

**8. Knowledge Center (30 sec)**
> "Separately, there's a real RAG system — upload your SOPs and
> inspection reports, ask questions in plain language, get answers with
> citations back to the actual source document."

Ask a pre-loaded question, show the sourced answer.

**Closing line:**
> "Four real technical layers working together — a live simulation
> engine, genuine trained ML models, multi-agent reasoning, and
> retrieval-augmented generation over real documents — not just an LLM
> wrapper."

## What ATLAS deliberately does NOT include (know this if asked)

From the original spec, intentionally cut to keep 5 modules deep rather
than 12 shallow: standalone Worker Intelligence, Maintenance Intelligence,
Compliance Intelligence, Asset Intelligence, Incident Intelligence, and
Analytics dashboards. If a judge asks, the honest answer is: "we scoped
to five modules we could make genuinely work end-to-end, rather than
spreading thin across all twelve from the original concept."