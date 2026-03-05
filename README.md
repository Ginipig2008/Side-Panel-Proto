This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# Cinev Studio Sidepanel Proto (한국어)

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
