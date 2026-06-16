# Roadmap — As if

Phasing for the As if iOS app. Phases are sequential in intent but not rigid;
each phase should stay native iOS and respect the guardrails in `AGENTS.md`.
Nothing beyond Phase 0 is committed — later phases are direction, not promises.

## Phase 0 — MVP-0: Pressure Loop baseline ✅ (current)

The first runnable native iOS SwiftUI prototype.

- MVP-0 Pressure Loop baseline:
  `Scenario Library → Scenario Detail → Practice Session → Voice Recording → Mock Feedback`.
- Local scenarios — five hand-written sample situations.
- Mock feedback — deterministic, generated on-device (no real AI).
- Audio recording — AVFoundation (permission, start/stop, temporary local file).
- Build CI — GitHub Actions builds the app on a macOS runner.

## Phase 1 — Refinement & content

Make the baseline deeper and more polished, still fully local.

- UI refinement — polish layouts, motion, and states.
- Scenario content expansion — more scenarios and categories.
- JSON scenario loading — move scenarios out of Swift into a loadable JSON
  format so content can grow without code changes.
- Better result feedback — richer, more specific mock feedback.
- Manual Xcode/device validation — run on simulator and device; verify
  microphone permission flow and recording UX (the parts CI cannot check).

## Phase 2 — Speech-to-text proof of concept

Introduce real transcription, scoped as a PoC.

- STT PoC — wire up real speech-to-text behind the existing recording flow.
- Whisper or Apple Speech evaluation — compare on-device Apple Speech vs.
  Whisper for accuracy, latency, and privacy.
- Basic pronunciation / transcript feedback — first real (non-mock) feedback
  derived from the transcript.

## Phase 3 — Accent lab & content pipeline

Explore voice output and regional content, as experiments.

- TTS / accent lab PoC — synthesized voices for prompts and accent practice.
- Miami English / Texas English content experiments — regional English variety
  content.
- Legal-safe content generation pipeline — a process for generating scenario
  content that is reviewed and legally safe.

---

**Guardrail reminder:** backend, auth, payments, analytics, subscriptions, STT,
TTS, and real AI are **out of scope until the corresponding phase is explicitly
started by a maintainer**. See `AGENTS.md`.
