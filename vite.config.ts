// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

function stripThreeSourceAnnotations(): Plugin {
  return {
    name: "strip-three-source-annotations",
    enforce: "pre",
    transform(code, id) {
      if (!id.replaceAll("\\", "/").endsWith("/src/components/ClassroomMap.tsx")) return null;

      const cleaned = code.replace(/\sdata-tsd-source=(?:"[^"]*"|'[^']*')/g, "");
      return cleaned === code ? null : { code: cleaned, map: null };
    },
  };
}

export default defineConfig({
  plugins: [stripThreeSourceAnnotations()],
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
