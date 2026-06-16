# Design Direction — As if

The design exists to make practice feel **consequential**. Every choice should
reinforce that these are real, high-stakes situations — not a game and not a
classroom.

## North star

A **premium, dark iOS app** that feels sharp, composed, and real-world. The user
should feel they are stepping into a serious moment, then leaving it sharper.

## Tone

- **High-stakes** — the stakes are real; the interface treats them that way.
- **Sharp** — precise typography, clean edges, no visual noise.
- **Composed** — calm, confident, never frantic or gamified.
- **Real-world** — grounded in actual situations (border, court, ER, street),
  not abstractions.

## Avoid

- **Cute education-app aesthetics** — no bright primary palettes, rounded
  cartoon shapes, confetti, badges, or streak gimmicks.
- **Mascots** — no characters, avatars, or anthropomorphic guides.
- **Generic chatbot UI** — no chat bubbles-as-product, no "AI assistant"
  framing, no typing-indicator tropes. The scenario is the interface.

## Visual language

- **Surfaces:** near-black backgrounds with subtly raised dark cards and hairline
  strokes. Depth comes from contrast and spacing, not heavy shadows.
- **Accent:** a single **restrained blue-violet** accent. Use it sparingly — for
  focus, primary actions, and progress. It should feel deliberate, never
  decorative. Avoid multi-color UIs.
- **Typography:** strong, confident type with clear hierarchy. Generous size for
  prompts and headlines; quiet, secondary tones for supporting text. Monospaced
  labels for small eyebrows/metadata.
- **Layout:** spacious, with room to breathe. One clear focus per screen.
- **Motion:** minimal and purposeful — progress, reveals, and state changes.
  Nothing playful or bouncy for its own sake.
- **Status colors:** reserve green/amber/red strictly for difficulty and
  feedback signals, not general decoration.

These tokens live in `AsIf/DesignSystem/Theme.swift`. Extend that system rather
than introducing ad-hoc colors, fonts, or styles.

## Product language guidance

- **Direct and grown-up.** Speak to a capable adult under pressure. Short,
  confident sentences.
- **No cutesy gamification copy.** No "Yay!", no cheerleading, no exclamation
  spam. Encouragement is earned and measured.
- **Honest about the mock.** Where feedback is simulated, say so plainly. Never
  imply real analysis that isn't happening (see `AGENTS.md`).
- **Real-world framing.** Use the language of the situation — "officer,"
  "prosecutor," "triage" — not classroom or quiz vocabulary.
- **No mascot voice.** The app speaks as a sharp coach, not a character.
- **Restraint over hype.** Confident, not loud. The product earns trust by
  feeling real, not by promising magic.
