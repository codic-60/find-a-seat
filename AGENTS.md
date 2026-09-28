<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep classroom availability deterministic in `src/lib/rooms.ts`; timetable facts must come from supplied source documents, never AI inference.
- Keep the 3D map client-only and derive its room state from `src/lib/rooms.ts` so the visual layer never becomes a second source of truth.
- Strip development source-inspector attributes from `ClassroomMap.tsx`; React Three Fiber treats `data-*` as Three.js object paths and crashes.
