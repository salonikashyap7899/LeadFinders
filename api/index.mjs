// Vercel serverless function entry.
//
// This file is committed so Vercel's build detects and registers a function
// at /api. The real Express app is bundled at build time by
// artifacts/api-server/build-vercel.mjs into ./_app.mjs (git-ignored). Keeping
// the entry tiny avoids @vercel/node type-checking the cross-package source
// graph; the generated bundle is already self-contained JavaScript.
export { default } from "./_app.mjs";
