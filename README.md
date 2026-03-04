# Cinev Studio Sidepanel Proto

`cinevstudio_sidepanel_ptoto` is a Next.js prototype for the Cinev Studio side panel UI. It is intended for rapid iteration on layout, interactions, and styling before integration into the main application.

## Running Locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the app:

```text
http://localhost:3000
```

## Notes

- Edit the UI in `src/app/page.tsx` (and related components) to see live updates.
- This project uses the Next.js App Router and TypeScript.

## Usage (Rough Guide)

This prototype is focused on the side panel UI. A simple way to explore it is:

1. Run the dev server and open the app.
2. Interact with the side panel elements to confirm layout and spacing.
3. Tweak styles and components in `src/app/page.tsx` (and related files) to iterate quickly.

## Feature Summary

Actual Working Features:
- Add/delete characters (Character panel + timeline).
- Add clips (Action/Facial/Camera/Dialogue).
- Auto placement to avoid clip overlaps.
- Clip edit/replace/delete via timeline context menu.
- Panel mode switching (`default`/`edit`/`replace`/`preview`).
- Camera preview → apply flow.

UI/Placeholder Features:
- EditPanel properties (Zoom/Angle/Speed) are UI-only.
- Dialogue text input has no persistence.
- Search inputs do not filter.
- Timeline transport/undo/redo/link controls are visual only.
- Object/Mood/Scene tabs are not implemented.
- Timeline internal Zustand store is not wired to the visible data.

## 한국어

`cinevstudio_sidepanel_ptoto`는 Cinev Studio의 사이드 패널 UI를 위한 Next.js 프로토타입입니다. 본 프로젝트는 메인 애플리케이션에 통합하기 전에 레이아웃, 인터랙션, 스타일을 빠르게 반복 검증하는 목적에 맞춰져 있습니다.

## 로컬 실행

1. 의존성 설치:

```bash
npm install
```

2. 개발 서버 실행:

```bash
npm run dev
```

3. 브라우저에서 접속:

```text
http://localhost:3000
```

## 참고

- `src/app/page.tsx`(및 관련 컴포넌트)를 수정하면 실시간으로 반영됩니다.
- 이 프로젝트는 Next.js App Router와 TypeScript를 사용합니다.

## 사용법 (대략)

이 프로토타입은 사이드 패널 UI에 초점을 맞춥니다. 간단한 확인 흐름은 다음과 같습니다.

1. 개발 서버를 실행하고 앱을 연다.
2. 사이드 패널 요소를 조작하며 레이아웃/간격을 확인한다.
3. `src/app/page.tsx`(및 관련 파일)에서 스타일과 컴포넌트를 수정하며 빠르게 반복한다.

## 기능 요약

실제 동작 기능:
- 캐릭터 추가/삭제 (Character 패널 + 타임라인).
- 클립 추가 (Action/Facial/Camera/Dialogue).
- 클립 겹침 방지 자동 배치.
- 타임라인 컨텍스트 메뉴로 편집/교체/삭제.
- 패널 모드 전환 (`default`/`edit`/`replace`/`preview`).
- 카메라 Preview → Apply 흐름.

UI/목업 기능:
- EditPanel 속성(Zoom/Angle/Speed 등)은 UI 전용.
- Dialogue 텍스트 입력은 저장/반영 없음.
- 검색 입력은 필터링 없음.
- 타임라인 재생/Undo/Redo/Link 컨트롤은 시각 요소만.
- Object/Mood/Scene 탭 미구현.
- 타임라인 내부 Zustand 스토어는 실제 데이터와 미연결.
