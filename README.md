# As if — Pressure Loop (iOS MVP)

**As if** is a high-stakes English conversation practice app for intermediate and
advanced learners. It drills the moments where your English has to perform under
real pressure — airport immigration, police stops, ER intake, courtroom
questioning, and fast local conversations.

This repository contains the first runnable **SwiftUI MVP prototype**, codenamed
**Pressure Loop**. It is a native iOS app — no web, no backend, no real AI yet.

## The core loop

```
Scenario Library → Scenario Detail → Practice Session → Voice Recording → Mock Feedback
```

1. **Library** — browse five high-stakes scenarios, filter by category.
2. **Detail** — a briefing: the stakes, what you're judged on, how it opens.
3. **Practice** — face each prompt out loud; tap to record your spoken answer.
4. **Recording** — real microphone capture via AVFoundation (saved locally).
5. **Result** — a mock scored feedback report to demonstrate the payoff.

## What's real vs. mocked

| Area | Status |
| --- | --- |
| Microphone permission + recording (AVFoundation) | **Real** — records to a temporary `.m4a` file |
| Scenario content | Local hand-written sample data (5 scenarios) |
| Speech-to-text | **Not implemented** (intentionally) |
| AI evaluation / scoring | **Mocked** — generated on-device, deterministic per session |
| Backend, auth, payments, analytics | Not present |

## Scenarios

- **Airport Immigration** — Secondary Inspection
- **Police Stop** — License and Registration
- **ER Intake** — Describe Your Symptoms
- **Courtroom** — Answer Under Pressure
- **Street Talk** — Fast Local Conversation

## How to run

Requirements: **Xcode 16 or newer** (the project uses file-system-synchronized
groups), targeting **iOS 17+**.

1. Open `AsIf.xcodeproj` in Xcode.
2. Select the **AsIf** scheme and an iOS 17+ simulator (e.g. iPhone 15 Pro) or a
   device.
3. Press **Run** (⌘R).

> Microphone note: the iOS Simulator can record using your Mac's microphone. If
> permission is denied, the session still runs end-to-end — recording is simply
> skipped — so navigation never breaks.

## Project structure

```
AsIf/
├── AsIfApp.swift              App entry + onboarding gate (RootView)
├── Models/
│   └── Models.swift           Scenario, DialogueTurn, PracticeSession, PracticeFeedback
├── Data/
│   ├── ScenarioData.swift     The 5 sample scenarios
│   └── MockFeedback.swift     On-device mock evaluation engine
├── Audio/
│   └── AudioRecorder.swift    AVFoundation recorder (permission, start/stop, file URL)
├── DesignSystem/
│   └── Theme.swift            Colors, typography, reusable card/button styles
├── Views/
│   ├── OnboardingView.swift
│   ├── ScenarioLibraryView.swift
│   ├── ScenarioDetailView.swift
│   ├── PracticeSessionView.swift
│   └── ResultView.swift
└── Assets.xcassets            AccentColor (blue-violet) + AppIcon
```

## Design

Premium, dark, high-stakes. Near-black surfaces, strong typography, generous
spacing, and a single restrained blue-violet accent. No mascots, no cute
education aesthetics, no generic chatbot UI.
