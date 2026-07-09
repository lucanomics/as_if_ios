# VERCEL_DEPLOYMENT — Vercel 정적 배포 안내

## 1. 배포 전제

DeskShield는 **정적 프론트엔드 앱**으로만 배포합니다. 앱이 웹에 배포되더라도 업무 데이터는 서버가 아니라
**사용자 브라우저 로컬 저장소**에만 저장됩니다.

## 2. 정적 프론트엔드 앱으로만 배포

- Vite 정적 빌드 → `dist/` 출력
- Vercel Static Hosting + SPA rewrite(`vercel.json`)
- 브라우저 `localStorage`(추후 IndexedDB)에만 데이터 저장

## 3. 사용하지 않는 것 (금지)

- Vercel Serverless Functions / API Routes / Edge Functions
- 클라우드 DB / Vercel KV / Vercel Postgres
- 외부 API 호출 / 원격 분석 / 텔레메트리 / 외부 에러 리포팅
- 로그인 / 계정 동기화 / 클라우드 백업
- 서버 로그에 업무 데이터가 남는 구조

리포지토리에 `api/` 디렉터리나 서버리스 함수가 없으며, `vercel.json`에도 함수 설정이 없습니다.

## 4. `npm run build` 확인 방법

```bash
npm install
npm run build     # tsc 타입체크 + vite 정적 빌드
npm run preview   # dist/ 로컬 미리보기
```

`dist/index.html`과 `dist/assets/*`가 생성되면 정상입니다.

## 5. Vercel 빌드 설정

| 항목 | 값 |
| --- | --- |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

`vercel.json`이 이미 이 값을 포함하고 있어 대시보드에서 자동 인식됩니다.

## 6. 환경변수

**필요 없습니다.** 어떤 시크릿/토큰/엔드포인트도 사용하지 않습니다.

## 7. 데이터 저장 위치

업무 데이터는 Vercel 서버가 아니라 **접속한 브라우저의 로컬 저장소**에만 저장됩니다. 서버로 전송되거나
서버 로그에 남지 않습니다.

## 8. 공용 PC 사용 금지

배포 URL이 공개될 수 있고 로컬 저장소에 기록이 남으므로, **공용 PC나 타인이 접근할 수 있는 기기에서
사용하지 마세요.**

## 9. noindex 설정

- `index.html`: `<meta name="robots" content="noindex, nofollow, ...">`, `googlebot` noindex
- `vercel.json`: `X-Robots-Tag: noindex, nofollow` 및 `Referrer-Policy: no-referrer` 헤더

## 10. 배포 후 직접 점검해야 할 체크리스트

- [ ] 배포 URL 접속 가능
- [ ] 첫 실행 경고(배포/개인정보) 표시
- [ ] `noindex` meta tag 및 `X-Robots-Tag` 헤더 확인
- [ ] 로그 저장 가능
- [ ] 새로고침 후 로컬 데이터 유지
- [ ] 다른 브라우저/시크릿 창에서는 데이터가 보이지 않음
- [ ] 개인정보 의심 패턴 경고 작동
- [ ] 내보내기 전 경고 작동
- [ ] 개발자도구 Network 탭에서 사용자 입력 데이터가 외부로 전송되지 않음
- [ ] 서버리스 함수가 생성되지 않았음(Vercel 대시보드 Functions 비어 있음)
- [ ] 환경변수에 민감정보가 없음

## 배포 명령 (사용자가 직접 실행)

```bash
# 예시 — 실제 배포는 사용자가 수행
npm i -g vercel
vercel          # 프리뷰 배포
vercel --prod   # 프로덕션 배포
```

> 이 문서는 배포 절차를 안내할 뿐이며, 실제 배포 명령 실행은 사용자에게 맡깁니다.
