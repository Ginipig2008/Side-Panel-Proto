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

## 한국어 문서

For Korean documentation, see `docs/README.ko.md`.
