# REBUILD_NOTES — as_if_ios → DeskShield 재구축 기록

## 1. 기존 `as_if_ios`에서 제거한 항목

기존 리포지토리는 iOS SwiftUI 앱 "As if Pressure Loop"였습니다. 다음을 제거했습니다.

- `AsIf/` — SwiftUI 앱 소스 전체
  - `AsIfApp.swift`, `Views/*`(Onboarding, PracticeSession, Result, ScenarioDetail, ScenarioLibrary),
    `Models/Models.swift`, `Data/*`(ScenarioData, MockFeedback), `Audio/AudioRecorder.swift`,
    `DesignSystem/Theme.swift`, `Assets.xcassets/*`
- `AsIf.xcodeproj/` — Xcode 프로젝트/스킴
- `.github/workflows/ios-build.yml` — iOS 빌드 워크플로
- 기존 문서: `README.md`, `AGENTS.md`, `DESIGN_DIRECTION.md`, `PRODUCT_BRIEF.md`, `ROADMAP.md`

## 2. 새로 구축한 DeskShield 구조

Vite + React + TypeScript + Tailwind CSS 기반 정적 SPA.

```
index.html                 noindex/nofollow, viewport, 인라인 파비콘
vite.config.ts             정적 빌드, base '/'
vercel.json                SPA rewrite + noindex 헤더
tailwind.config.js / postcss.config.js
tsconfig*.json / .eslintrc.cjs
src/
  main.tsx
  app/
    App.tsx                셸/네비게이션/모달/온보딩/단축키
    store.tsx             전역 상태 + 로컬 저장 영속화(Context)
  components/
    QuickLogForm.tsx  Dashboard.tsx  ReviewQueue.tsx  WorkSessionPanel.tsx
    PrivacyCleanup.tsx  PhraseLibrary.tsx  ManualArchive.tsx  ChecklistPanel.tsx
    SearchPanel.tsx  ReconstructionMode.tsx  ExportPanel.tsx  DeployNotice.tsx
    NationalityPicker.tsx  LogCard.tsx  ui.tsx
  data/
    constants.ts  countries.ts  presets.ts  phraseTemplates.ts
    checklistTemplates.ts  sampleData.ts
  lib/
    storage.ts  privacyGuard.ts  riskDetector.ts  riskCombinationDetector.ts
    exportUtils.ts  keyboardShortcuts.ts  retention.ts  audit.ts
    analytics.ts  autoTemplate.ts
  types/index.ts
  styles/globals.css
문서: README.md  PRIVACY_DESIGN.md  LOCAL_USAGE.md  REBUILD_NOTES.md  VERCEL_DEPLOYMENT.md
```

제안된 파일 구조를 따르되, 재사용을 위해 `NationalityPicker`, `LogCard`, `ui`(공용 프리미티브),
`analytics`, `autoTemplate`를 추가했습니다.

## 3. 삭제하지 않은 항목

- `.git/` (히스토리·원격 설정 보존)
- 원격 저장소 설정(`origin`) — 변경하지 않음
- `.gitignore` — 삭제하지 않고 Node/Vite 기준으로 내용만 갱신
- `LICENSE` — 원래 존재하지 않았음(있었다면 보존 대상)

## 4. 로컬 백업 절차

작업 전 미커밋 변경사항은 없었고(working tree clean), 안전을 위해 현재 HEAD를 가리키는 로컬 백업
브랜치를 만들었습니다.

```
backup/before-deskshield-rebuild-20260709-0559
```

기존 iOS 앱으로 되돌리려면 이 브랜치를 체크아웃하면 됩니다. (원격으로 push하지 않았습니다.)

## 5. 작업 브랜치명

- 지정 개발 브랜치: `claude/deskshield-mvp-rebuild-7x10j6` (이 브랜치에서 작업/커밋)
- 백업 브랜치: `backup/before-deskshield-rebuild-20260709-0559`

> 참고: 원래 지시서의 예시 브랜치명 `rebuild/deskshield-vercel-mvp` 대신, 이 세션에 지정된 개발 브랜치
> `claude/deskshield-mvp-rebuild-7x10j6`를 사용했습니다(지정 브랜치 규칙 준수).

## 6. 원격 push 여부

**원격 push를 하지 않았습니다.** 사용자의 명시적 지시 없이 push/PR 생성/실제 Vercel 배포/외부 서비스
연결을 수행하지 않았습니다. 커밋은 로컬에만 존재합니다.

## 7. 남은 리포 정리 TODO

- 사용자가 검토 후 원격 push 및 (원하면) PR 생성
- Phase 2: IndexedDB 저장 드라이버, PWA, 로컬 앱 잠금(PIN)
- 필요 시 백업 브랜치 정리(iOS 앱을 완전히 폐기하기로 확정되면 삭제 가능)
- `node_modules/`, `dist/`는 `.gitignore` 처리됨(커밋 대상 아님)
