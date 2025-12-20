import * as esbuild from "esbuild";

async function build() {
  await esbuild.build({
    entryPoints: ["src/code/main.ts"],
    bundle: true,
    outfile: "dist/code.js",
    target: "es6",
    minify: true,
  });
}

build();

