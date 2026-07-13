import { build, type BuildOptions, context } from "esbuild";
import { copyFile, mkdir } from "node:fs/promises";

const options: BuildOptions = {
  entryPoints: ["src/content.ts"],
  bundle: true,
  format: "iife",
  target: "es2022",
  outfile: "dist/content.js",
};

await mkdir("dist", { recursive: true });
await copyFile("manifest.json", "dist/manifest.json");
await copyFile("LICENSE", "dist/LICENSE");

if (process.argv.includes("--watch")) {
  const ctx = await context(options);
  await ctx.watch();
  console.log("watching for changes");
} else {
  await build(options);
}
