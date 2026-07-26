// Builds the API into a single self-contained JavaScript file that Vercel
// serves as a serverless function, WITHOUT letting @vercel/node compile the
// TypeScript itself.
//
// Why: @vercel/node re-typechecks/transpiles the function's TypeScript with
// its own module-resolution rules (nodenext), which do not match this
// workspace (written for bundler resolution). That produced spurious type
// errors and runtime module-not-found failures for workspace packages whose
// exports point at raw .ts source. Bundling here with esbuild (the same tool
// the Replit production build uses) resolves and inlines everything —
// including workspace packages — into one plain .mjs the runtime can load
// directly.
//
// Output: <repo-root>/api/index.mjs — Vercel picks up `api/` at the project
// root as a serverless function. The bundle re-exports the Express app as the
// default (request handler) export.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { build as esbuild } from "esbuild";

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(artifactDir, "..", "..");
const outDir = path.resolve(repoRoot, "api");
const outFile = path.resolve(outDir, "index.mjs");
const entryFile = path.resolve(outDir, "_entry.serverless.ts");

async function buildVercelFunction() {
  await mkdir(outDir, { recursive: true });

  // Small entry that re-exports the Express app as the default handler.
  await writeFile(
    entryFile,
    'import app from "../artifacts/api-server/src/app.js";\nexport default app;\n',
  );

  try {
    await esbuild({
      entryPoints: [entryFile],
      platform: "node",
      target: "node22",
      bundle: true,
      format: "esm",
      outfile: outFile,
      logLevel: "info",
      // Only truly-native / unbundleable modules are externalized. None of
      // them are used by this app, so effectively everything is inlined.
      external: [
        "*.node",
        "sharp",
        "better-sqlite3",
        "sqlite3",
        "pg-native",
        "bufferutil",
        "utf-8-validate",
      ],
      // Bundled CJS deps (e.g. express) expect `require`, `__dirname`,
      // `__filename` — provide them in the ESM output.
      banner: {
        js: [
          "import { createRequire as __cr } from 'node:module';",
          "import { fileURLToPath as __furl } from 'node:url';",
          "import { dirname as __dname } from 'node:path';",
          "globalThis.require = __cr(import.meta.url);",
          "globalThis.__filename = __furl(import.meta.url);",
          "globalThis.__dirname = __dname(globalThis.__filename);",
        ].join("\n"),
      },
    });
  } finally {
    await rm(entryFile, { force: true });
  }
}

buildVercelFunction().catch((err) => {
  console.error(err);
  process.exit(1);
});
