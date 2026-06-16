# Product Brief — As if

## Brand name

**As if**

## One-line definition

As if is a high-stakes English conversation practice app that drills the
real-world, high-pressure moments where your English has to perform.

## Target users

Intermediate and advanced English learners who can already hold a conversation
but freeze, fumble, or lose composure under pressure — and professionals,
travelers, and immigrants who face consequential English interactions:

- Travelers and immigrants facing border, immigration, and official questioning.
- Professionals who must perform in court, medical, or law-enforcement contexts.
- Advanced learners who want realistic pressure, not gentle classroom drills.

## Core promise

Practice the conversations that actually scare you — until the real thing feels
like something you've already done. As if recreates the pressure, pace, and
follow-up of real high-stakes exchanges so composure becomes a trained habit.

## MVP-0 scope (Pressure Loop)

The first runnable milestone delivers one complete loop:

`Scenario Library → Scenario Detail → Practice Session → Voice Recording → Mock Feedback`

Included:

- Native iOS SwiftUI app, dark premium interface.
- Five local sample scenarios (immigration, police stop, ER intake, courtroom,
  street talk).
- On-device voice recording via AVFoundation (microphone permission, start/stop,
  temporary local file).
- **Mock** feedback (deterministic, generated on-device) to demonstrate the
  payoff at the end of the loop.
- Onboarding that sets the high-stakes tone.

## Out of scope (for MVP-0)

- Backend, accounts, authentication.
- Payments, subscriptions, paywalls.
- Analytics / tracking.
- Real speech-to-text (STT) or transcription.
- Real AI evaluation or scoring.
- Text-to-speech (TTS) / synthesized voices.
- Web, React Native, Flutter, or HTML versions.
- Cloud content or remote scenario delivery.

## Future expansion areas

These are directions, not commitments — see `ROADMAP.md` for phasing:

- Expanded and externally authored scenario content (JSON-loaded).
- Real STT for transcript-based feedback (Apple Speech / Whisper PoC).
- Pronunciation and fluency analysis.
- TTS / accent lab experiments (e.g. regional English varieties).
- Richer, more specific result feedback.
- A legal-safe content generation pipeline.
