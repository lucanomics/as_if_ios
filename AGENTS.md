# AGENTS.md

Operating instructions for AI coding agents (and humans) working in this
repository. Read this before making changes. Its purpose is to keep future work
aligned with the **native iOS MVP** direction and prevent scope drift.

## What this project is

**As if** is a **native iOS SwiftUI app** for high-stakes English conversation
practice. The current milestone is **MVP-0**, codenamed **Pressure Loop**.

- Language: Swift
- UI: SwiftUI
- Min target: iOS 17+
- Project: `AsIf.xcodeproj`, scheme `AsIf`
- See `PRODUCT_BRIEF.md`, `DESIGN_DIRECTION.md`, and `ROADMAP.md` for product,
  design, and phasing context.

## Hard rules

1. **This is a native iOS SwiftUI app.** Keep it that way.
2. **Work only inside this repository.** Do not reach into or create other repos.
3. **Do not create web apps, HTML mockups, React Native apps, or Flutter apps.**
   No cross-platform frameworks, no web prototypes, no HTML/JS artifacts.
4. **Do not add backend, auth, payments, analytics, subscriptions, STT, TTS, or
   real AI** unless a maintainer explicitly requests it. The MVP feedback is a
   local mock by design.
5. **Keep MVP-0 focused on the Pressure Loop:**
   `Scenario Library → Scenario Detail → Practice Session → Voice Recording → Mock Feedback`.
6. **Preserve the existing Xcode project.** Do not regenerate, rename, or
   restructure `AsIf.xcodeproj` without a clear, requested reason. The project
   uses Xcode 16 file-system-synchronized groups — new files under `AsIf/` are
   picked up automatically.
7. **Keep the app buildable through GitHub Actions.** The CI workflow
   (`.github/workflows/ios-build.yml`) must stay green. If a change can break the
   build, verify it.
8. **Prefer small PRs.** One focused concern per PR. Draft PRs by default.
9. **Do not duplicate models, views, services, or app entry points.** There is
   exactly one `@main` entry (`AsIfApp`), one set of models, etc. Extend existing
   types instead of creating parallel copies.
10. **Do not claim Xcode or manual UX verification unless it was actually
    performed.** CI verifies *compilation only* — it does not run the app, and it
    does not validate microphone permission flow, recording, or UX. If you did
    not run it on a simulator/device, say so plainly.

## Project layout (do not duplicate)

```
AsIf/
├── AsIfApp.swift              Single @main entry + onboarding gate (RootView)
├── Models/Models.swift        Scenario, DialogueTurn, PracticeSession, PracticeFeedback
├── Data/                      ScenarioData (samples) + MockFeedback (local mock)
├── Audio/AudioRecorder.swift  AVFoundation recorder
├── DesignSystem/Theme.swift   Colors, typography, shared styles
├── Views/                     Onboarding, Library, Detail, Practice, Result
└── Assets.xcassets            AccentColor (blue-violet) + AppIcon
```

## Definition of done for a change

- Builds for the iOS Simulator (CI green, or a clear note that CI must confirm).
- Stays within MVP-0 scope unless explicitly expanded by a maintainer.
- No new dependencies unless justified and requested.
- Documentation updated when behavior or structure changes.
- PR description states exactly what was and was not verified.
